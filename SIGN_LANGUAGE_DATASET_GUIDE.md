# MOUNAM Sign Language Dataset Strategy & Model Architecture Guide

> **Tagline:** *Every Voice Deserves to Be Heard.*  
> **Platform:** MOUNAM Assistive Communication Platform

---

## 1. Ethical Foundation & Truthful Representation

### Disclaimer on Sign Language Recognition
MOUNAM does **not** claim full, unconstrained Indian Sign Language (ISL) or American Sign Language (ASL) recognition. Sign languages are complete natural languages featuring intricate spatial grammar, facial non-manual markers, two-handed compound signs, and continuous co-articulation. 

Currently, MOUNAM implements:
1. **Geometric Rule-based Posture Recognition**: High precision for well-defined static hand shapes (Stop, Peace, Yes, Water).
2. **Temporal Sliding-Window Sequence Buffer**: 12–20 frame (~400–700ms) motion trajectory analysis for dynamic signs (Hello wave, lateral motion).
3. **Pluggable Machine Learning Adapter Interface (`ISignClassifier`)**: Architecture ready to load ONNX / TensorFlow.js / TFLite models once trained on verified native signer datasets.

---

## 2. Mathematical Landmark Normalization Pipeline

Raw 3D camera coordinates $(x_i, y_i, z_i)$ from computer vision vary dramatically based on camera distance, device resolution, and user placement. To ensure models generalize:

1. **Origin Translation (Wrist-Centering)**:
   $$\mathbf{P}_i' = \mathbf{P}_i - \mathbf{P}_0 \quad (i = 0, \dots, 20)$$
   Where $\mathbf{P}_0$ is the wrist landmark.
2. **Scale Invariance (Palm Sizing)**:
   $$s = \|\mathbf{P}_9 - \mathbf{P}_0\|_2$$
   Where $\mathbf{P}_9$ is the Middle Finger Metacarpophalangeal (MCP) joint. Normalized coordinate:
   $$\hat{\mathbf{P}}_i = \frac{\mathbf{P}_i'}{s}$$
3. **Handedness Canonicalization**:
   If the hand detected is the Left Hand, the horizontal axis is mirrored:
   $$\hat{x}_i \leftarrow -\hat{x}_i$$
   This allows machine learning models to be trained on a canonical right-hand topology while serving both left- and right-handed signers seamlessly.
4. **Finger Extension & Spread Invariance**:
   Computes fingertip-to-wrist distance ratios and inter-finger Euclidean spreads.

---

## 3. Dataset Collection Strategy for Model Training

To construct a production-grade assistive sign classifier, datasets must adhere to rigorous ethical and technical standards:

### A. Community Involvement & Native Signers
- Work directly with Deaf community members, certified sign language interpreters, and organizations (e.g., Indian Sign Language Research and Training Centre - ISLRTC).
- Signs must be annotated and verified by native signers to ensure dialectal authenticity.

### B. Environmental & Demographic Diversity
- **Signer Diversity**: Different hand morphologies, skin tones, ages, and left/right dominance.
- **Lighting Variation**: Direct sunlight, low-light indoor, backlit conditions.
- **Camera Angles**: Slight tilt ($0^\circ$ to $30^\circ$) reflecting typical smartphone and laptop webcams.

### C. Static vs. Dynamic Motion Signs
- **Static Signs** (e.g., numbers, alphabet fingerspelling, fixed poses): Require 30–50 unique samples per class across signers.
- **Dynamic Signs** (e.g., Thank You, Hello, Help, Where): Require temporal sequences recorded at 30 FPS across 15–30 frames, capturing preparation, stroke, and retraction phases.

### D. Data Partitioning
- **Train / Validation / Test Split**: 70% / 15% / 15%, strictly partitioned by **subject/signer ID** (cross-subject validation) to prevent overfitting to individual hand sizes.

---

## 4. Privacy & Consent Architecture

1. **No Video/Photo Storage**: The MOUNAM data collector tool stores **only 63 floating-point coordinates per frame** ($\hat{x}, \hat{y}, \hat{z}$ for 21 joints). Raw video frames are discarded immediately after landmark extraction.
2. **Explicit Informed Consent**: Users must explicitly check the informed consent toggle before the recording controls unlock.
3. **Local-Only Storage**: Consented landmark JSON files reside solely in the user's browser storage (`localStorage`) and can be exported or permanently deleted at any moment.

---

## 5. Future Model Training Roadmap
1. Export consented landmark JSON sequences.
2. Train a lightweight 1D-CNN or Temporal Transformer (e.g. Spatial-Temporal Graph Convolutional Network - ST-GCN).
3. Export model to ONNX Web / TensorFlow.js format.
4. Implement the `ISignClassifier` interface to swap the baseline classifier with the trained deep model without altering any frontend UI code.
