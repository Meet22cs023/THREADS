import { useState } from "react";
import useShowToast from "./useShowToast";

const usePreviewVideo = () => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const showToast = useShowToast();
  
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("video/")) {
      // Check video size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        showToast("File too large", "Video must be less than 100MB", "error");
        setVideoUrl(null);
        setVideoFile(null);
        return;
      }
      
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setVideoUrl(reader.result);
        setVideoFile(file);
      };
      
      reader.readAsDataURL(file);
    } else if (file) {
      showToast("Invalid file type", "Please select a video file", "error");
      setVideoUrl(null);
      setVideoFile(null);
    }
  };
  
  return { handleVideoChange, videoUrl, setVideoUrl, videoFile, setVideoFile };
};

export default usePreviewVideo; 