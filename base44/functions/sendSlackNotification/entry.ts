import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const accessToken = await base44.asServiceRole.connectors.getAccessToken("slack");
        
        const { channel, message, type, data } = await req.json();

        // Build message based on type
        let blocks = [];
        let text = message || '';

        if (type === 'new_user') {
            const { userName, userEmail, generatorCategory, simulatorCategory } = data;
            text = `🆕 New User Signup: ${userName || userEmail}`;
            blocks = [
                {
                    type: "header",
                    text: { type: "plain_text", text: "🆕 New User Signup", emoji: true }
                },
                {
                    type: "section",
                    fields: [
                        { type: "mrkdwn", text: `*Name:*\n${userName || 'N/A'}` },
                        { type: "mrkdwn", text: `*Email:*\n${userEmail}` },
                        { type: "mrkdwn", text: `*Generator Use:*\n${generatorCategory || 'Not specified'}` },
                        { type: "mrkdwn", text: `*Simulator Use:*\n${simulatorCategory || 'Not specified'}` }
                    ]
                },
                {
                    type: "context",
                    elements: [{ type: "mrkdwn", text: `Signed up at ${new Date().toLocaleString()}` }]
                }
            ];
        } else if (type === 'feature_usage') {
            const { userName, featureType, details } = data;
            const featureEmoji = featureType === 'simulation' ? '🧪' : featureType === 'formula' ? '🧬' : '📱';
            const featureName = featureType === 'simulation' ? 'Chemical Simulator' : featureType === 'formula' ? 'Formula Generator' : 'Quick Scan';
            text = `${featureEmoji} ${userName} used ${featureName}`;
            blocks = [
                {
                    type: "header",
                    text: { type: "plain_text", text: `${featureEmoji} ${featureName} Used`, emoji: true }
                },
                {
                    type: "section",
                    text: { type: "mrkdwn", text: `*User:* ${userName}` }
                },
                {
                    type: "section",
                    fields: featureType === 'simulation' ? [
                        { type: "mrkdwn", text: `*Chemicals:*\n${details.chemicals?.join(', ') || 'N/A'}` },
                        { type: "mrkdwn", text: `*Risk Score:*\n${details.riskScore || 'N/A'}` }
                    ] : featureType === 'formula' ? [
                        { type: "mrkdwn", text: `*Formula:*\n${details.formulaName || 'N/A'}` },
                        { type: "mrkdwn", text: `*Type:*\n${details.productType || 'N/A'}` }
                    ] : [
                        { type: "mrkdwn", text: `*Product:*\n${details.productName || 'N/A'}` },
                        { type: "mrkdwn", text: `*Barcode:*\n${details.barcode || 'N/A'}` }
                    ]
                }
            ];
        } else if (type === 'learning_complete') {
            const { userName, courseName } = data;
            text = `🎓 ${userName} completed ${courseName}`;
            blocks = [
                {
                    type: "header",
                    text: { type: "plain_text", text: "🎓 Learning Milestone", emoji: true }
                },
                {
                    type: "section",
                    text: { type: "mrkdwn", text: `*${userName}* completed *${courseName}*` }
                }
            ];
        } else if (type === 'update_announcement') {
            const { updateTitle, updateDescription, features, attachmentUrl } = data;
            text = `🚀 Platform Update: ${updateTitle}`;
            blocks = [
                {
                    type: "header",
                    text: { type: "plain_text", text: `🚀 Platform Update: ${updateTitle}`, emoji: true }
                },
                {
                    type: "section",
                    text: { type: "mrkdwn", text: updateDescription }
                },
                {
                    type: "section",
                    text: { type: "mrkdwn", text: `*New Features:*\n${features?.map(f => `• ${f}`).join('\n') || 'See details in the app'}` }
                }
            ];
            
            // Add image block if attachment is provided
            if (attachmentUrl) {
                blocks.push({
                    type: "image",
                    image_url: attachmentUrl,
                    alt_text: updateTitle
                });
            }
        }

        // Send to Slack
        const response = await fetch('https://slack.com/api/chat.postMessage', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                channel: channel || '#general',
                text: channel === '#all-suttain' ? `<!channel> ${text}` : text,
                blocks: blocks.length > 0 ? blocks : undefined,
                link_names: true
            })
        });

        const result = await response.json();

        if (!result.ok) {
            return Response.json({ error: result.error }, { status: 400 });
        }

        return Response.json({ success: true, data: result });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});