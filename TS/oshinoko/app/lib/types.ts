export interface Video {
  id: string;
  title: string;
  video_url: string;
  overlay_url: string;
  original_video_width: number;
  original_video_height: number;
  group_name: string;
}

export interface YOLOAnnotation {
  class_id: number;
  x_center: number;
  y_center: number;
  width: number;
  height: number;
}

export interface AnnotatedSnapshot {
  id: string;
  imageBlob: Blob;
  annotations: YOLOAnnotation[];
}

/**
 * label_id is same as class_id in YOLOAnnotation
 */
export interface LabelInfo {
  label_id: number;
  label_name: string;
  label_color: string;
}

/**
 * group_member_id is same as class_id in YOLOAnnotation
 */
export interface MemberProfile {
  group_member_id: number;
  name: string;
  associated_color: string;
  group_name: string;
}

export interface BoundingBox {
  x: number; // 左上のX座標
  y: number; // 左上のY座標
  width: number;
  height: number;
  label_id?: number | undefined;
  color: string;
}
