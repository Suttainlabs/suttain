import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Upload, Loader2, AlertCircle, ImageIcon, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { AgroProvider, useAgro } from '@/components/agro/AgroContext';
import AgroHeader from '@/components/agro/AgroHeader';
import { LANGUAGE_NAMES } from '@/components/agro/translations';

function PhotoContent() {
  const { t, language, activeFarmer, activeFarm } = useAgro();
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cropHint, setCropHint] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!photoFile) {
      setError(t('no_photo'));
      return;
    }
    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const uploadRes = await base44.integrations.Core.UploadFile({ file: photoFile });
      const uploadedUrl = uploadRes.file_url;

      const prompt = `You are Suttain Farm, an AI crop diagnostic tool. Analyze this photo and provide a diagnosis.

Farm context:
- Crops grown: ${activeFarm?.crops?.join(', ') || 'Not specified'}
- Soil type: ${activeFarm?.soil_type || 'Not specified'}
${cropHint ? `- Farmer says this crop is: ${cropHint}` : ''}

Instructions:
1. Identify the crop in the photo (if possible).
2. Determine if there's a disease, pest, or nutrient deficiency.
3. Provide a likely diagnosis.
4. Rate your confidence: high, medium, or low. Be honest if you're not certain.
5. Recommend a practical next step.
6. If confidence is low, recommend consulting a local expert.

Respond in ${LANGUAGE_NAMES[language]} language.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: [uploadedUrl],
        response_json_schema: {
          type: "object",
          properties: {
            diagnosis: { type: "string" },
            confidence: { type: "string", enum: ["high", "medium", "low"] },
            recommended_action: { type: "string" },
            crop_identified: { type: "string" }
          }
        }
      });

      setResult(response);

      await base44.entities.Diagnosis.create({
        farm_id: activeFarm.id,
        farmer_id: activeFarmer?.id,
        photo_url: uploadedUrl,
        diagnosis: response.diagnosis,
        confidence: response.confidence,
        recommended_action: response.recommended_action,
        crop: response.crop_identified
      });

      await base44.entities.AdvisorySession.create({
        farm_id: activeFarm.id,
        farmer_id: activeFarmer?.id,
        question: cropHint ? `Photo diagnosis for ${cropHint}` : 'Photo diagnosis',
        photo_url: uploadedUrl,
        ai_response: `${response.diagnosis} (Confidence: ${response.confidence}). ${response.recommended_action}`,
        session_type: 'photo',
        language
      });
    } catch (err) {
      console.error('Analysis error:', err);
      setError(t('error') + ' ' + t('retry'));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRetake = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!activeFarm) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <AgroHeader title={t('photo_diagnosis')} />
        <div className="bg-white rounded-2xl border border-[#D4C5B0] p-8 text-center">
          <AlertCircle className="w-12 h-12 text-[#8B6F47] mx-auto mb-4" />
          <p className="text-[#2D5016] font-semibold mb-4">{t('no_farm_selected')}</p>
          <Link to="/AgroFarmerProfile" className="inline-flex items-center gap-2 bg-[#4A7C2A] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#2D5016] transition-colors min-h-[44px]">
            {t('go_to_profile')}
          </Link>
        </div>
      </div>
    );
  }

  const confidenceColors = { high: 'bg-green-100 text-green-700', medium: 'bg-amber-100 text-amber-700', low: 'bg-red-100 text-red-700' };
  const confidenceLabels = { high: t('confidence_high'), medium: t('confidence_medium'), low: t('confidence_low') };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <AgroHeader title={t('photo_diagnosis')} />
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-[#D4C5B0] p-5 sm:p-6">
          {!photoPreview ? (
            <div className="text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
                id="photo-input"
              />
              <label htmlFor="photo-input" className="cursor-pointer block">
                <div className="border-2 border-dashed border-[#D4C5B0] rounded-2xl p-12 hover:border-[#4A7C2A] hover:bg-[#F8F6F0] transition-colors">
                  <Camera className="w-12 h-12 text-[#4A7C2A] mx-auto mb-3" />
                  <p className="font-semibold text-[#2D5016] mb-1">{t('take_photo')}</p>
                  <p className="text-sm text-[#5B7553]">{t('upload_photo')}</p>
                </div>
              </label>
            </div>
          ) : (
            <div>
              <img src={photoPreview} alt="Crop" className="w-full rounded-xl mb-4 max-h-64 object-cover" />
              {!result && (
                <button onClick={handleRetake} className="text-sm text-[#5B7553] hover:text-[#2D5016] font-medium">
                  {t('retake')}
                </button>
              )}
            </div>
          )}
        </div>

        {photoPreview && !result && (
          <div className="bg-white rounded-2xl border border-[#D4C5B0] p-5">
            <label className="text-sm font-semibold text-[#2D5016] mb-1 block">{t('select_crop_hint')}</label>
            <input
              type="text"
              value={cropHint}
              onChange={(e) => setCropHint(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[#D4C5B0] text-[#2D5016] focus:outline-none focus:ring-2 focus:ring-[#4A7C2A] min-h-[44px]"
              placeholder={t('crop_placeholder')}
            />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {photoPreview && !result && (
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full flex items-center justify-center gap-2 bg-[#4A7C2A] text-white font-semibold py-3.5 rounded-xl hover:bg-[#2D5016] transition-colors disabled:opacity-50 min-h-[44px]"
          >
            {analyzing ? (
              <><Loader2 className="w-5 h-5 animate-spin" />{t('analyzing')}</>
            ) : (
              <><ImageIcon className="w-5 h-5" />{t('analyze')}</>
            )}
          </button>
        )}

        {result && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#D4C5B0] p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-[#4A7C2A]" />
                <h3 className="font-bold text-[#2D5016]">{t('diagnosis_result')}</h3>
              </div>
              {result.crop_identified && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-[#8B6F47] uppercase tracking-wider mb-1">{t('crop_identified')}</p>
                  <p className="text-sm font-medium text-[#2D5016]">{result.crop_identified}</p>
                </div>
              )}
              <div className="mb-4">
                <p className="text-xs font-semibold text-[#8B6F47] uppercase tracking-wider mb-1">{t('diagnosis_result')}</p>
                <p className="text-sm text-[#2D5016]">{result.diagnosis}</p>
              </div>
              {result.confidence && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-[#8B6F47] uppercase tracking-wider mb-1">{t('confidence')}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${confidenceColors[result.confidence] || ''}`}>
                    {confidenceLabels[result.confidence] || result.confidence}
                  </span>
                </div>
              )}
              {result.recommended_action && (
                <div>
                  <p className="text-xs font-semibold text-[#8B6F47] uppercase tracking-wider mb-1">{t('recommended_action')}</p>
                  <p className="text-sm text-[#2D5016]">{result.recommended_action}</p>
                </div>
              )}
            </div>
            <p className="text-xs text-[#8B6F47] px-1">{t('photo_disclaimer')}</p>
            <button
              onClick={handleRetake}
              className="w-full flex items-center justify-center gap-2 bg-white border border-[#D4C5B0] text-[#2D5016] font-semibold py-3.5 rounded-xl hover:bg-[#F8F6F0] transition-colors min-h-[44px]"
            >
              <Camera className="w-5 h-5" />
              {t('retake')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AgroPhotoDiagnosis() {
  return <AgroProvider><PhotoContent /></AgroProvider>;
}