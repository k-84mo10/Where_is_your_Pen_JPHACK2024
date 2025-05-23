'use client';

import { useState, useEffect } from 'react';
import Header from '@/app/ui/Header';
import PreviewSnapshots from '@/app/ui/PreviewSnapshots';
import AnnotationStudio from '@/app/ui/AnnotationStudio';
import VideoList from '@/app/ui/VideoList';
import {
  AnnotatedSnapshot,
  LabelInfo,
  MemberProfile,
  Video,
} from '@/app/lib/types';
import { convertSnapshotToFiles } from '@/app/lib/snapshotUtils';
import {
  annotationUrlPrefix,
  backendUrl,
  memberProfileUrlPrefix,
  videoUrlPrefix,
} from '@/app/lib/config';
import axios from 'axios';
import { categories, CategoryItem } from '@/app/lib/categories';

const DEFAULT_VIDEO_URL = `${videoUrlPrefix}/file/Supernova.mp4`;

const AnnotationPage: React.FC = () => {
  const [isAnnotationMode, setIsAnnotationMode] = useState(false);
  const [annotatedSnapshots, setAnnotatedSnapshots] = useState<
    AnnotatedSnapshot[]
  >([]);
  const [labels, setLabels] = useState<LabelInfo[]>([]);
  const [groupName, setGroupName] = useState<string>(categories[0].id);
  const [videoUrl, setVideoUrl] = useState<string>(DEFAULT_VIDEO_URL);

  const addAnnotatedSnapshot = (snapshot: AnnotatedSnapshot) => {
    setAnnotatedSnapshots((prev) => [...prev, snapshot]);
  };

  // Fetch video data based on videoId from URL parameter
  const fetchVideoData = async (videoId: string) => {
    try {
      const response = await axios.get(
        `${backendUrl}/${videoUrlPrefix}/${videoId}`,
      );
      const videoData = response.data;
      console.log('Video data fetched:', videoData);
      setVideoUrl(videoData.video_url);
      setGroupName(videoData.group_name);
      console.log('Video data fetched:', videoData);
    } catch (error) {
      console.error('Failed to fetch video data:', error);
    }
  };

  const fetchLabelInfo = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/${memberProfileUrlPrefix}`,
        {
          params: { groupName },
        },
      );
      const labels: LabelInfo[] = response.data.map(
        (member: MemberProfile) => ({
          label_id: member.group_member_id,
          label_name: member.name,
          label_color: member.associated_color,
        }),
      );
      setLabels(labels);
      console.log('Labels fetched:', response.data);
    } catch (error) {
      console.error('Failed to fetch labels:', error);
    }
  };

  useEffect(() => {
    // URLSearchParamsを使ってvideoIdパラメータを取得
    const params = new URLSearchParams(window.location.search);
    const videoId = params.get('videoId');
    console.log('videoId:', videoId);
    if (videoId) {
      fetchVideoData(videoId);
    }
  }, []);

  useEffect(() => {
    if (groupName) {
      fetchLabelInfo();
    }
    // NOTE: errorの理由がまだよくわかっていないので無視
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupName]);

  const uploadAnnotatedSnapshots = async () => {
    if (annotatedSnapshots.length === 0) {
      alert('No snapshots to upload.');
      return;
    }
    try {
      for (const snapshot of annotatedSnapshots) {
        const { imageFile, annotationFile } = convertSnapshotToFiles(snapshot);

        // Prepare FormData
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('annotation', annotationFile);
        formData.append('groupName', groupName);

        // Send to backend
        await axios.post(`${backendUrl}/${annotationUrlPrefix}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      console.log('All snapshots uploaded successfully.');
      setAnnotatedSnapshots([]);
    } catch (error) {
      console.error('Error uploading snapshots:', error);
      alert('Failed to upload snapshots. Please try again.');
    }
  };

  const clearSnapshots = () => {
    if (annotatedSnapshots.length === 0) {
      alert('No snapshots to clear.');
      return;
    }
    if (window.confirm('Are you sure you want to clear all snapshots?')) {
      setAnnotatedSnapshots([]);
    }
  };

  const handleVideoSelect = (video: Video) => {
    setVideoUrl(video.video_url);
    console.log('Selected video:', videoUrl);
  };

  const handleGroupChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setGroupName(event.target.value);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Side: Video Player and Annotation Tools */}
        <div className="w-3/4 p-4 flex flex-col space-y-4 relative">
          <AnnotationStudio
            addAnnotatedSnapshot={addAnnotatedSnapshot}
            isAnnotationMode={isAnnotationMode}
            setIsAnnotationMode={setIsAnnotationMode}
            labels={labels}
            videoUrl={videoUrl}
          />
        </div>

        {/* Right Side: Group Selection, Video List or Snapshot Preview */}
        <div className="w-1/4 p-4 bg-gray-50">
          {/* Group Selector */}
          <div className="mb-4">
            <label htmlFor="groupSelector" className="block mb-2 text-gray-700">
              Select Group:
            </label>
            <select
              id="groupSelector"
              value={groupName}
              onChange={handleGroupChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              {categories.map((category: CategoryItem) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {isAnnotationMode || annotatedSnapshots.length !== 0 ? (
            <>
              <button
                onClick={uploadAnnotatedSnapshots}
                className="mt-4 p-2 bg-blue-600 text-white rounded"
              >
                Upload Snapshots
              </button>
              <button
                onClick={clearSnapshots}
                className="mt-4 p-2 bg-red-600 text-white rounded"
              >
                Clear Snapshots
              </button>

              <PreviewSnapshots
                snapshots={annotatedSnapshots}
                labels={labels}
              />
            </>
          ) : (
            <VideoList
              onSelectVideo={handleVideoSelect}
              groupName={groupName}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnotationPage;
