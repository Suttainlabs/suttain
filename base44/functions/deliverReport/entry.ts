import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reportId, deliveryOptions } = await req.json();

    // Fetch the report
    const reports = await base44.entities.Report.filter({ id: reportId });
    const report = reports[0];
    
    if (!report) {
      return Response.json({ error: 'Report not found' }, { status: 404 });
    }

    const results = {
      email: [],
      slack: [],
      webhook: []
    };

    const delivery = deliveryOptions || report.delivery || {};
    const reportUrl = `https://app.base44.com/report/${reportId}`;

    // Send email notifications
    if (delivery.email_recipients?.length) {
      for (const email of delivery.email_recipients) {
        try {
          await base44.integrations.Core.SendEmail({
            to: email,
            subject: `Report Ready: ${report.title}`,
            body: generateEmailBody(report, reportUrl)
          });
          results.email.push({ email, status: 'sent' });
        } catch (err) {
          results.email.push({ email, status: 'failed', error: err.message });
        }
      }
    }

    // Send Slack notifications
    if (delivery.slack_channels?.length) {
      try {
        const accessToken = await base44.asServiceRole.connectors.getAccessToken("slack");
        
        for (const channel of delivery.slack_channels) {
          try {
            const slackResponse = await fetch('https://slack.com/api/chat.postMessage', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                channel: channel,
                text: `📊 *New Report Available: ${report.title}*`,
                blocks: generateSlackBlocks(report, reportUrl)
              })
            });
            
            const slackResult = await slackResponse.json();
            results.slack.push({ channel, status: slackResult.ok ? 'sent' : 'failed', error: slackResult.error });
          } catch (err) {
            results.slack.push({ channel, status: 'failed', error: err.message });
          }
        }
      } catch (err) {
        results.slack.push({ status: 'failed', error: 'Slack not connected: ' + err.message });
      }
    }

    // Send webhook notifications
    if (delivery.webhook_urls?.length) {
      for (const webhookUrl of delivery.webhook_urls) {
        try {
          // Validate webhook URL to prevent SSRF — reject private/loopback/link-local IPs
          let parsedWebhookUrl;
          try {
            parsedWebhookUrl = new URL(webhookUrl);
          } catch {
            results.webhook.push({ url: webhookUrl, status: 'failed', error: 'Invalid URL' });
            continue;
          }
          if (parsedWebhookUrl.protocol !== 'https:' && parsedWebhookUrl.protocol !== 'http:') {
            results.webhook.push({ url: webhookUrl, status: 'failed', error: 'Invalid protocol' });
            continue;
          }
          if (parsedWebhookUrl.username || parsedWebhookUrl.password) {
            results.webhook.push({ url: webhookUrl, status: 'failed', error: 'Credentials in URL not allowed' });
            continue;
          }
          const isPrivateIp = (ip) => {
            const parts = ip.split('.').map(Number);
            if (parts.length !== 4) return true;
            const [a, b] = parts;
            return (
              a === 10 ||
              (a === 172 && b >= 16 && b <= 31) ||
              (a === 192 && b === 168) ||
              a === 127 ||
              (a === 169 && b === 254) ||
              a === 0 ||
              (a === 100 && b >= 64 && b <= 127)
            );
          };
          let resolvedIps;
          try {
            resolvedIps = await Deno.resolveDns(parsedWebhookUrl.hostname, 'A');
          } catch {
            results.webhook.push({ url: webhookUrl, status: 'failed', error: 'DNS resolution failed' });
            continue;
          }
          if (resolvedIps.length === 0 || resolvedIps.some(isPrivateIp)) {
            results.webhook.push({ url: webhookUrl, status: 'failed', error: 'Resolved IP is blocked' });
            continue;
          }
          const validatedIp = resolvedIps[0];
          const pinnedUrl = `${parsedWebhookUrl.protocol}//${validatedIp}${parsedWebhookUrl.pathname}${parsedWebhookUrl.search}`;

          const webhookResponse = await fetch(pinnedUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Host: parsedWebhookUrl.hostname },
            redirect: 'error',
            body: JSON.stringify({
              event: 'report_generated',
              report: {
                id: reportId,
                title: report.title,
                type: report.report_type,
                url: reportUrl,
                generated_at: report.metadata?.generated_at,
                ai_insights: report.ai_insights
              }
            })
          });
          results.webhook.push({ url: webhookUrl, status: webhookResponse.ok ? 'sent' : 'failed' });
        } catch (err) {
          results.webhook.push({ url: webhookUrl, status: 'failed', error: err.message });
        }
      }
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateEmailBody(report, reportUrl) {
  const insights = report.ai_insights || {};
  return `
Report: ${report.title}
Type: ${report.report_type}
Generated: ${report.metadata?.generated_at || 'N/A'}

EXECUTIVE SUMMARY
${insights.executive_summary || 'No summary available'}

KEY FINDINGS
${(insights.key_findings || []).map((f, i) => `${i + 1}. ${f}`).join('\n')}

RECOMMENDATIONS
${(insights.recommendations || []).map((r, i) => `${i + 1}. ${r}`).join('\n')}

View the full interactive report: ${reportUrl}

---
This report was automatically generated by Suttain.
  `.trim();
}

function generateSlackBlocks(report, reportUrl) {
  const insights = report.ai_insights || {};
  return [
    {
      type: "header",
      text: { type: "plain_text", text: `📊 ${report.title}`, emoji: true }
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: `*Type:* ${report.report_type}\n*Generated:* ${report.metadata?.generated_at || 'N/A'}` }
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: `*Summary:*\n${insights.executive_summary || 'No summary available'}` }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Key Findings:*\n${(insights.key_findings || []).slice(0, 3).map(f => `• ${f}`).join('\n')}`
      }
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "View Full Report", emoji: true },
          url: reportUrl,
          style: "primary"
        }
      ]
    }
  ];
}