interface VideoPlayerProps {
  fileId: string;
  title: string;
}

const VideoPlayer = ({ fileId, title }: VideoPlayerProps) => {
  const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;

  return (
    <div className="aspect-video w-full max-w-4xl mx-auto bg-black rounded-lg shadow-2xl overflow-hidden">
      <iframe
        src={embedUrl}
        title={title}
        allow="autoplay; encrypted-media"
        allowFullScreen
        className="w-full h-full border-0"
      ></iframe>
    </div>
  );
};

export default VideoPlayer;
