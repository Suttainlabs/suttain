import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

const VIDEO_URL = 'https://media.base44.com/videos/public/688eaf737ea3b621021f8bac/3346cb9b6_generated_video.mp4';
const AUDIO_URL = 'https://media.base44.com/files/public/688eaf737ea3b621021f8bac/68af5043b_speech.mp3';

export default function AgroDemoVideo() {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handlePlayPause = () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      if (audio) audio.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => {
        if (audio && !isMuted) audio.play();
      }).catch(() => setHasError(true));
      setIsPlaying(true);
    }
  };

  const handleVideoEnd = () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (video) video.currentTime = 0;
    if (audio) audio.currentTime = 0;
    setIsPlaying(false);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    const next = !isMuted;
    setIsMuted(next);
    if (audio) audio.muted = next;
  };

  return (
    <div className="relative w-full bg-[#F5F1E8]">
      <video
        ref={videoRef}
        src={VIDEO_URL}
        className="w-full aspect-video object-cover"
        onEnded={handleVideoEnd}
        onError={() => setHasError(true)}
        playsInline
        muted
        preload="metadata"
      />

      {/* Hidden narration audio track */}
      <audio ref={audioRef} src={AUDIO_URL} preload="auto" />

      {/* Controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 px-4 py-3 bg-gradient-to-t from-black/60 to-transparent">
        <button
          onClick={handlePlayPause}
          className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#4A7C2A] text-white hover:bg-[#2D5016] transition-colors flex-shrink-0"
          aria-label={isPlaying ? 'Pause demo' : 'Play demo'}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
        <button
          onClick={toggleMute}
          className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/90 text-[#2D5016] hover:bg-white transition-colors flex-shrink-0"
          aria-label={isMuted ? 'Unmute narration' : 'Mute narration'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <span className="text-xs font-semibold text-white/90">
          {hasError ? 'Unable to load video' : isPlaying ? 'Now playing demo...' : 'Press play to watch the demo'}
        </span>
      </div>

      {/* Play prompt overlay when not playing */}
      {!isPlaying && !hasError && (
        <button
          onClick={handlePlayPause}
          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
          aria-label="Play demo video"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#4A7C2A]/90 text-white shadow-2xl hover:bg-[#4A7C2A] transition-colors">
            <Play className="w-9 h-9 ml-1" />
          </div>
        </button>
      )}
    </div>
  );
}