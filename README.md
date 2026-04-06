#mandibular-implant-prediction-cbct
AI-based mandibular implant size prediction using Mask R-CNN and PCA on CBCT images



AI-Based Mandibular Implant Size Prediction using CBCT Imaging
Computer Vision Research Internship

Department of Oral & Maxillofacial Surgery × AI/ML Collaboration
Dayananda Sagar Institutions, Bengaluru
Oct 2025 – Feb 2026

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Overview

This project was developed as part of an interdisciplinary research study focused on automating mandibular implant planning using CBCT (Cone Beam Computed Tomography) images.

The work contributes to the dissertation:
“Developing and Validating an Artificial Intelligence Algorithm for Prediction of Implant Sizes to be used in Mandible Using CBCT Images – An Artificial Intelligence Study.”

The system combines deep learning-based segmentation with statistical modeling to generate clinically valid implant size recommendations.
<img width="294" height="482" alt="image" src="https://github.com/user-attachments/assets/2a272e3a-c6a4-4f50-9689-360f02b78af4" />
<img width="294" height="482" alt="image" src="https://github.com/user-attachments/assets/5bcfd02d-d062-4f5f-9d52-28301d88f0b0" />

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Problem Statement

Manual implant planning from CBCT scans requires:
• Precise identification of cortical bone boundaries
• Accurate measurement of available bone dimensions
• Consideration of safety constraints
This process is time-consuming, subjective, and operator-dependent.

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Methodology

Cortical Bone Segmentation

• Model: Mask R-CNN with ResNet-50 FPN backbone
• Task: Instance segmentation on CBCT cross-sectional slices
• Output: Cortical bone masks
• Performance: > 0.95 Mask IoU

Feature Extraction

• Extracted anatomical measurements from segmented regions
• Focus on bone width, height, and structural boundaries

Implant Size Prediction

• Method: Principal Component Analysis (PCA)
• Purpose: Model dimensional relationships and reduce variability
• Output: Recommended implant dimensions (length and diameter)
• Accuracy: ±1 mm deviation from manual clinical measurements

Safety Constraints

• Incorporated rule-based constraints to ensure:
  – Avoidance of critical anatomical regions
  – Clinically acceptable implant dimensions
• Ensures outputs are usable in real clinical scenarios

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

System Pipeline

CBCT Images
   ↓
Preprocessing (slice extraction, normalization)
   ↓
Mask R-CNN (segmentation)
   ↓
Cortical Bone Mask
   ↓
Feature Extraction
   ↓
PCA Model
   ↓
Safety-Constrained Implant Recommendation

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Tech Stack

• Python
• PyTorch / Torchvision
• OpenCV
• NumPy
• Scikit-learn (PCA)

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Results

★ Segmentation Accuracy: > 0.95 Mask IoU
★ Implant Prediction Error: ±1 mm
★ Output: Clinically usable implant size recommendations
<img width="500" height="234" alt="image" src="https://github.com/user-attachments/assets/0ecadee2-378e-4875-be5b-6bb121f4f174" />
<img width="2183" height="812" alt="image" src="https://github.com/user-attachments/assets/b6588061-7b89-4fd3-a665-02db987cb171" />
<img width="1901" height="898" alt="Screenshot 2026-02-28 170618" src="https://github.com/user-attachments/assets/cbe5a17b-f06c-4438-9feb-f6b398c10d3c" />

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Collaboration Context

This work was carried out in collaboration between:
• Department of Oral and Maxillofacial Surgery
• Department of Artificial Intelligence and Machine Learning

The project involved continuous interaction between clinical experts (for validation and constraints) and the AI/ML team (for modeling and implementation).

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Key Takeaways

• Real-world AI systems require domain constraints in addition to accuracy
• Medical imaging pipelines must balance precision and interpretability
• Statistical methods like PCA can be effective when combined with strong feature extraction

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Future Work

• Extend to 3D volumetric analysis using 3D CNNs
• Replace PCA with learned regression models
• Develop a clinical interface for real-time usage
• Expand dataset for improved generalization

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Acknowledgment

I thank the Department of Oral and Maxillofacial Surgery for their guidance and for recognizing this work as part of an academic research contribution.

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Contact

• GitHub: https://github.com/munagalachandu
• LinkedIn: https://www.linkedin.com/in/munagala-chandu
