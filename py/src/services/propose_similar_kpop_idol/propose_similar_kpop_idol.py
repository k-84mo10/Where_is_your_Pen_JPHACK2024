import json
import os
import sys

import numpy as np
from env import DATASETS_DIR, MODELS_DIR, PROCESSED_DATA_DIR

sys.path.append(os.path.join(os.path.dirname(__file__), "AdaFace"))
from face_alignment import align
from inference import load_pretrained_model, to_input


def propose_similar_kpop_idol(
    input_photo_path="./Hashimoto_Kanna.jpg",
    embedding_json_path=f"{PROCESSED_DATA_DIR}/kpop_idol_faces_embeddings/idol_features.json",
    model_path=f"{MODELS_DIR}/AdaFace/pretrained/adaface_ir50_ms1mv2.ckpt",
):
    with open(embedding_json_path, "r") as f:
        idol_features = json.load(f)

    model = load_pretrained_model("ir_50", model_path)
    aligned_rgb_img = align.get_aligned_face(input_photo_path)
    bgr_tensor_input = to_input(aligned_rgb_img)
    face_feature, _ = model(bgr_tensor_input)
    face_feature = face_feature.detach().numpy()

    similarity_scores = {}
    for idol_name, idol_feature_list in idol_features.items():
        idol_feature = np.array(idol_feature_list)
        similarity_scores[idol_name] = face_feature @ idol_feature.T

    # 大きい順にソート
    sorted_similarity_scores = sorted(similarity_scores.items(), key=lambda x: x[1], reverse=True)

    # 類似度の高い順に出力
    for idol_name, similarity_score in sorted_similarity_scores:
        print(idol_name, similarity_score)

    most_similar_idol_name, _ = sorted_similarity_scores[0]
    return (
        most_similar_idol_name,
        f"{DATASETS_DIR}/kpop_idol_faces/{most_similar_idol_name}/{most_similar_idol_name}.jpg",
    )


if __name__ == "__main__":
    propose_similar_kpop_idol()
