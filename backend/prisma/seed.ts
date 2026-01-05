import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.comment.deleteMany();
  await prisma.codeVersion.deleteMany();
  await prisma.experimentPaper.deleteMany();
  await prisma.experiment.deleteMany();
  await prisma.paper.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tag.deleteMany();

  console.log('✅ Cleared existing data');

  // Create users
  const password = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'alice@research.edu',
      password,
      name: 'Alice Johnson',
      role: 'STUDENT',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@research.edu',
      password,
      name: 'Bob Smith',
      role: 'STUDENT',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'prof.chen@research.edu',
      password,
      name: 'Prof. Chen',
      role: 'FACULTY',
    },
  });

  const user4 = await prisma.user.create({
    data: {
      email: 'diana@research.edu',
      password,
      name: 'Diana Rodriguez',
      role: 'STUDENT',
    },
  });

  const user5 = await prisma.user.create({
    data: {
      email: 'prof.lee@research.edu',
      password,
      name: 'Prof. Lee',
      role: 'FACULTY',
    },
  });

  const user6 = await prisma.user.create({
    data: {
      email: 'charlie@research.edu',
      password,
      name: 'Charlie Kim',
      role: 'COLLABORATOR',
    },
  });

  const user7 = await prisma.user.create({
    data: {
      email: 'eve@research.edu',
      password,
      name: 'Eve Patel',
      role: 'STUDENT',
    },
  });

  const user8 = await prisma.user.create({
    data: {
      email: 'frank@research.edu',
      password,
      name: 'Frank Nguyen',
      role: 'STUDENT',
    },
  });

  const user9 = await prisma.user.create({
    data: {
      email: 'prof.garcia@research.edu',
      password,
      name: 'Prof. Garcia',
      role: 'ADMIN',
    },
  });

  const user10 = await prisma.user.create({
    data: {
      email: 'grace@research.edu',
      password,
      name: 'Grace Wong',
      role: 'COLLABORATOR',
    },
  });

  console.log('✅ Created 10 users');

  // Create teams
  const aiTeam = await prisma.team.create({
    data: {
      name: 'AI Research Lab',
      description: 'Deep learning and computer vision research',
      members: {
        create: [
          { userId: user1.id, role: 'owner' },
          { userId: user2.id, role: 'editor' },
          { userId: user3.id, role: 'viewer' },
          { userId: user4.id, role: 'editor' },
          { userId: user6.id, role: 'viewer' },
          { userId: user7.id, role: 'editor' },
          { userId: user8.id, role: 'viewer' },
        ],
      },
    },
  });

  const bioTeam = await prisma.team.create({
    data: {
      name: 'Bioinformatics Lab',
      description: 'Genomics and protein analysis',
      members: {
        create: [
          { userId: user2.id, role: 'owner' },
          { userId: user1.id, role: 'editor' },
          { userId: user5.id, role: 'viewer' },
          { userId: user6.id, role: 'editor' },
          { userId: user9.id, role: 'admin' },
        ],
      },
    },
  });

  const quantumTeam = await prisma.team.create({
    data: {
      name: 'Quantum Computing Group',
      description: 'Quantum algorithms and simulation research',
      members: {
        create: [
          { userId: user3.id, role: 'owner' },
          { userId: user4.id, role: 'viewer' },
          { userId: user5.id, role: 'editor' },
          { userId: user6.id, role: 'collaborator' },
          { userId: user10.id, role: 'editor' },
        ],
      },
    },
  });

  const roboticsTeam = await prisma.team.create({
    data: {
      name: 'Robotics and Automation Lab',
      description: 'Autonomous systems and reinforcement learning',
      members: {
        create: [
          { userId: user4.id, role: 'owner' },
          { userId: user7.id, role: 'editor' },
          { userId: user8.id, role: 'viewer' },
          { userId: user10.id, role: 'collaborator' },
        ],
      },
    },
  });

  const ethicsTeam = await prisma.team.create({
    data: {
      name: 'AI Ethics and Policy Group',
      description: 'Ethical implications of AI and policy recommendations',
      members: {
        create: [
          { userId: user9.id, role: 'owner' },
          { userId: user3.id, role: 'viewer' },
          { userId: user5.id, role: 'editor' },
        ],
      },
    },
  });

  console.log('✅ Created 5 teams');

  // Create tags
  const mlTag = await prisma.tag.create({ data: { name: 'Machine Learning' } });
  const cvTag = await prisma.tag.create({ data: { name: 'Computer Vision' } });
  const nlpTag = await prisma.tag.create({ data: { name: 'NLP' } });
  const dataTag = await prisma.tag.create({ data: { name: 'Data Analysis' } });
  const genomicsTag = await prisma.tag.create({ data: { name: 'Genomics' } });
  const proteinTag = await prisma.tag.create({ data: { name: 'Protein Folding' } });
  const quantumTag = await prisma.tag.create({ data: { name: 'Quantum Computing' } });
  const simulationTag = await prisma.tag.create({ data: { name: 'Simulation' } });
  const rlTag = await prisma.tag.create({ data: { name: 'Reinforcement Learning' } });
  const roboticsTag = await prisma.tag.create({ data: { name: 'Robotics' } });
  const ethicsTag = await prisma.tag.create({ data: { name: 'AI Ethics' } });
  const privacyTag = await prisma.tag.create({ data: { name: 'Privacy' } });
  const fairnessTag = await prisma.tag.create({ data: { name: 'Fairness' } });
  const explainabilityTag = await prisma.tag.create({ data: { name: 'Explainability' } });
  const optimizationTag = await prisma.tag.create({ data: { name: 'Optimization' } });

  console.log('✅ Created 15 tags');

  // Create papers
  const paper1 = await prisma.paper.create({
    data: {
      title: 'Attention Is All You Need',
      authors: 'Vaswani et al.',
      url: 'https://arxiv.org/abs/1706.03762',
      summary: 'This paper introduces the Transformer architecture, which relies entirely on attention mechanisms.',
      findings: 'The Transformer model achieves state-of-the-art results on machine translation tasks while being more parallelizable.',
      methodology: 'Self-attention mechanisms with multi-head attention and positional encoding.',
      limitations: 'Requires large amounts of training data and computational resources.',
      uploadedById: user1.id,
      teamId: aiTeam.id,
    },
  });

  const paper2 = await prisma.paper.create({
    data: {
      title: 'ResNet: Deep Residual Learning for Image Recognition',
      authors: 'He et al.',
      url: 'https://arxiv.org/abs/1512.03385',
      summary: 'Introduces residual connections to enable training of very deep neural networks.',
      findings: 'ResNet won ImageNet 2015 with 152 layers, showing skip connections prevent vanishing gradients.',
      methodology: 'Residual blocks with skip connections, batch normalization.',
      limitations: 'Still requires significant computational resources for training.',
      uploadedById: user2.id,
      teamId: aiTeam.id,
    },
  });

  const paper3 = await prisma.paper.create({
    data: {
      title: 'BERT: Pre-training of Deep Bidirectional Transformers',
      authors: 'Devlin et al.',
      url: 'https://arxiv.org/abs/1810.04805',
      summary: 'BERT uses bidirectional transformers for language understanding.',
      findings: 'Achieves state-of-the-art on 11 NLP tasks through masked language modeling.',
      methodology: 'Masked language modeling and next sentence prediction pre-training.',
      limitations: 'Computationally expensive to train from scratch.',
      uploadedById: user1.id,
      teamId: aiTeam.id,
    },
  });

  const paper4 = await prisma.paper.create({
    data: {
      title: 'AlphaFold: A Solution to a 50-Year-Old Grand Challenge in Biology',
      authors: 'Jumper et al.',
      url: 'https://www.nature.com/articles/s41586-021-03819-2',
      summary: 'Deep learning system for predicting protein structures from amino acid sequences.',
      findings: 'Achieves 90% accuracy on CASP14, revolutionizing structural biology.',
      methodology: 'End-to-end differentiable architecture with Evoformer blocks and structure module.',
      limitations: 'Performance drops for very large proteins; requires multiple sequence alignments.',
      uploadedById: user2.id,
      teamId: bioTeam.id,
    },
  });

  const paper5 = await prisma.paper.create({
    data: {
      title: 'Quantum Supremacy Using a Programmable Superconducting Processor',
      authors: 'Arute et al.',
      url: 'https://www.nature.com/articles/s41586-019-1666-5',
      summary: 'Demonstrates quantum supremacy with a 53-qubit processor.',
      findings: 'Task completed in 200 seconds that would take supercomputer 10,000 years.',
      methodology: 'Random circuit sampling on Sycamore processor with error mitigation.',
      limitations: 'Limited to specific tasks; scalability challenges with noise.',
      uploadedById: user3.id,
      teamId: quantumTeam.id,
    },
  });

  const paper6 = await prisma.paper.create({
    data: {
      title: 'Hi-C: A Method to Study the Three-Dimensional Architecture of Genomes',
      authors: 'Lieberman-Aiden et al.',
      url: 'https://www.science.org/doi/10.1126/science.1181369',
      summary: 'Technique to map chromatin interactions genome-wide.',
      findings: 'Reveals fractal globule folding and compartmentalization in human genome.',
      methodology: 'Proximity ligation of cross-linked chromatin fragments.',
      limitations: 'Requires high-quality nuclei; resolution limited by sequencing depth.',
      uploadedById: user5.id,
      teamId: bioTeam.id,
    },
  });

  const paper7 = await prisma.paper.create({
    data: {
      title: 'Variational Quantum Eigensolver',
      authors: 'Peruzzo et al.',
      url: 'https://www.nature.com/articles/ncomms5213',
      summary: 'Hybrid quantum-classical algorithm for ground state energy estimation.',
      findings: 'Successfully applied to molecular Hamiltonians on small quantum devices.',
      methodology: 'Unitary coupled cluster ansatz optimized variationally.',
      limitations: 'Barren plateaus in optimization landscape for large systems.',
      uploadedById: user4.id,
      teamId: quantumTeam.id,
    },
  });

  const paper8 = await prisma.paper.create({
    data: {
      title: 'Proximal Policy Optimization Algorithms',
      authors: 'Schulman et al.',
      url: 'https://arxiv.org/abs/1707.06347',
      summary: 'PPO algorithm for reinforcement learning that balances sample efficiency and stability.',
      findings: 'Outperforms TRPO in continuous control tasks with simpler implementation.',
      methodology: 'Clipped surrogate objective with multiple epochs of minibatch updates.',
      limitations: 'Hyperparameter sensitive; may require careful tuning for discrete actions.',
      uploadedById: user7.id,
      teamId: roboticsTeam.id,
    },
  });

  const paper9 = await prisma.paper.create({
    data: {
      title: 'Fairness Without Demographics in Repeated Loss Minimization',
      authors: 'Agarwal et al.',
      url: 'https://arxiv.org/abs/2007.00545',
      summary: 'Demographic-free approach to fair classification via calibration constraints.',
      findings: 'Achieves comparable utility to unconstrained models while ensuring fairness.',
      methodology: 'Repeated loss minimization with calibration on proxy labels.',
      limitations: 'Requires access to interaction data; performance depends on proxy quality.',
      uploadedById: user9.id,
      teamId: ethicsTeam.id,
    },
  });

  const paper10 = await prisma.paper.create({
    data: {
      title: 'LIME: Local Interpretable Model-agnostic Explanations',
      authors: 'Ribeiro et al.',
      url: 'https://arxiv.org/abs/1602.04938',
      summary: 'Explains individual predictions of any black-box classifier.',
      findings: 'Users find LIME explanations intuitive and faithful to model behavior.',
      methodology: 'Local surrogate models fitted around perturbed instances.',
      limitations: 'Explanations can be unstable for high-dimensional inputs.',
      uploadedById: user10.id,
      teamId: ethicsTeam.id,
    },
  });

  const paper11 = await prisma.paper.create({
    data: {
      title: 'YOLOv4: Optimal Speed and Accuracy of Object Detection',
      authors: 'Bochkovskiy et al.',
      url: 'https://arxiv.org/abs/2004.10934',
      summary: 'Improvements to YOLO for real-time object detection.',
      findings: 'Achieves 43.5% AP on COCO at 65 FPS on V100 GPU.',
      methodology: 'Bag of freebies and specialties like CSPDarknet and PANet.',
      limitations: 'Trade-offs in small object detection compared to two-stage detectors.',
      uploadedById: user8.id,
      teamId: aiTeam.id,
    },
  });

  const paper12 = await prisma.paper.create({
    data: {
      title: 'GPT-3: Language Models are Few-Shot Learners',
      authors: 'Brown et al.',
      url: 'https://arxiv.org/abs/2005.14165',
      summary: 'Scaling up language models to 175B parameters for few-shot learning.',
      findings: 'Zero-shot and few-shot performance competitive with fine-tuned models on many tasks.',
      methodology: 'Autoregressive transformer with dataset and context examples.',
      limitations: 'High inference cost; potential for generating harmful content.',
      uploadedById: user1.id,
      teamId: aiTeam.id,
    },
  });

  const paper13 = await prisma.paper.create({
    data: {
      title: 'scikit-learn: Machine Learning in Python',
      authors: 'Pedregosa et al.',
      url: 'https://jmlr.org/papers/v12/pedregosa11a.html',
      summary: 'Open-source library for machine learning in Python.',
      findings: 'Provides simple and efficient tools for data mining and analysis.',
      methodology: 'Built on NumPy, SciPy, and matplotlib.',
      limitations: 'Not optimized for very large-scale data; focuses on classical ML.',
      uploadedById: user6.id,
      teamId: bioTeam.id,
    },
  });

  const paper14 = await prisma.paper.create({
    data: {
      title: 'Quantum Approximate Optimization Algorithm',
      authors: 'Farhi et al.',
      url: 'https://arxiv.org/abs/1411.4028',
      summary: 'QAOA for solving combinatorial optimization problems on near-term quantum devices.',
      findings: 'Approximates solutions to MaxCut and other NP-hard problems.',
      methodology: 'Alternating parameterized quantum circuits and cost Hamiltonians.',
      limitations: 'Performance degrades with problem size; requires good initial parameters.',
      uploadedById: user3.id,
      teamId: quantumTeam.id,
    },
  });

  const paper15 = await prisma.paper.create({
    data: {
      title: 'Differential Privacy: A Survey of Results',
      authors: 'Dwork',
      url: 'https://www.microsoft.com/en-us/research/publication/differential-privacy-a-survey-of-results/',
      summary: 'Foundational concepts and results in differential privacy.',
      findings: 'Provides provable privacy guarantees for data analysis.',
      methodology: 'Adding noise scaled to sensitivity of queries.',
      limitations: 'Privacy-utility trade-off; challenging for interactive settings.',
      uploadedById: user9.id,
      teamId: ethicsTeam.id,
    },
  });

  console.log('✅ Created 15 papers');

  // Create experiments
  const exp1 = await prisma.experiment.create({
    data: {
      title: 'ResNet-50 Fine-tuning on Medical Images',
      hypothesis: 'Fine-tuning ResNet-50 on medical imaging data will achieve >90% accuracy for disease classification.',
      method: `1. Load pre-trained ResNet-50 from ImageNet
2. Replace final layer for 5-class classification
3. Fine-tune on 10,000 X-ray images
4. Use data augmentation (rotation, flip, zoom)
5. Train for 50 epochs with early stopping`,
      observations: 'Training converged after 35 epochs. Validation loss plateaued around epoch 30.',
      results: `Accuracy: 92.3%
Precision: 91.8%
Recall: 90.5%
F1-Score: 91.1%
Best performing on pneumonia detection (95% accuracy).
Struggled with rare disease classes (78% accuracy).`,
      failures: 'Initial learning rate of 0.01 caused training instability. Reduced to 0.001 for stable convergence.',
      nextSteps: 'Try ensemble methods with multiple architectures. Collect more data for rare disease classes.',
      status: 'COMPLETE',
      authorId: user1.id,
      teamId: aiTeam.id,
      tags: {
        connect: [{ id: mlTag.id }, { id: cvTag.id }],
      },
    },
  });

  const exp2 = await prisma.experiment.create({
    data: {
      title: 'Transformer-based Text Summarization',
      hypothesis: 'A fine-tuned BERT model can generate accurate abstractive summaries for research papers.',
      method: `1. Use BERT-base model
2. Fine-tune on CNN/DailyMail dataset
3. Implement beam search for generation
4. Evaluate using ROUGE metrics`,
      observations: 'Model generates fluent summaries but occasionally misses key technical details.',
      results: `ROUGE-1: 0.42
ROUGE-2: 0.19
ROUGE-L: 0.38
Generated summaries are coherent but sometimes too generic.`,
      status: 'IN_PROGRESS',
      authorId: user2.id,
      teamId: aiTeam.id,
      tags: {
        connect: [{ id: mlTag.id }, { id: nlpTag.id }],
      },
    },
  });

  const exp3 = await prisma.experiment.create({
    data: {
      title: 'Data Augmentation Impact on Small Datasets',
      hypothesis: 'Aggressive data augmentation can improve model performance on datasets with <1000 samples.',
      method: `Test different augmentation strategies:
- Baseline: No augmentation
- Mild: Random flip, rotation ±15°
- Aggressive: Flip, rotation ±45°, zoom, brightness, contrast
- AutoAugment: Learned augmentation policies`,
      observations: 'Aggressive augmentation shows promise but needs tuning.',
      results: 'Preliminary: Mild augmentation gives 5% improvement. Testing aggressive now.',
      status: 'BLOCKED',
      authorId: user1.id,
      teamId: aiTeam.id,
      tags: {
        connect: [{ id: mlTag.id }, { id: dataTag.id }],
      },
    },
  });

  const exp4 = await prisma.experiment.create({
    data: {
      title: 'Vision Transformer (ViT) for Satellite Imagery',
      hypothesis: 'Vision Transformers will outperform CNNs on satellite image classification.',
      method: `1. Use ViT-B/16 pre-trained on ImageNet
2. Fine-tune on Sentinel-2 satellite images
3. Classify land use (urban, forest, water, agriculture, barren)
4. Compare with ResNet-50 baseline`,
      observations: 'ViT requires more training data than expected. Performance improves significantly after 100 epochs.',
      results: `ViT Accuracy: 88.7%
ResNet-50 Accuracy: 85.3%
ViT shows better performance on complex terrain patterns.`,
      nextSteps: 'Experiment with different patch sizes. Try ViT-L for potentially better results.',
      status: 'COMPLETE',
      authorId: user2.id,
      teamId: aiTeam.id,
      tags: {
        connect: [{ id: mlTag.id }, { id: cvTag.id }],
      },
    },
  });

  const exp5 = await prisma.experiment.create({
    data: {
      title: 'Zero-Shot Learning for Rare Classes',
      hypothesis: 'CLIP model can classify rare object categories without training examples.',
      method: `1. Use pre-trained CLIP (ViT-B/32)
2. Test on rare animal species (20 classes, 0 training examples)
3. Compare with few-shot learning baseline (5 examples per class)`,
      observations: 'CLIP performs surprisingly well on categories with clear visual features.',
      status: 'IN_PROGRESS',
      authorId: user1.id,
      teamId: aiTeam.id,
      tags: {
        connect: [{ id: mlTag.id }, { id: cvTag.id }],
      },
    },
  });

  const exp6 = await prisma.experiment.create({
    data: {
      title: 'AlphaFold Fine-Tuning for Custom Proteins',
      hypothesis: 'Fine-tuning AlphaFold on custom protein datasets will improve prediction accuracy for novel sequences.',
      method: `1. Use AlphaFold2 base model
2. Fine-tune on PDB structures of custom proteins
3. Evaluate on held-out test set using TM-score
4. Incorporate evolutionary data from multiple alignments`,
      observations: 'Model converges faster than expected, but overfitting observed on small datasets.',
      results: `TM-score: 0.89 (improved from 0.82 baseline)
pLDDT: 92.5 (high confidence regions)
Challenges with disordered regions (TM-score: 0.65).`,
      failures: 'Insufficient MSA depth for some sequences led to poor alignments.',
      nextSteps: 'Integrate RoseTTAFold for ensemble predictions. Expand dataset with synthetic structures.',
      status: 'COMPLETE',
      authorId: user2.id,
      teamId: bioTeam.id,
      tags: {
        connect: [{ id: mlTag.id }, { id: proteinTag.id }],
      },
    },
  });

  const exp7 = await prisma.experiment.create({
    data: {
      title: 'Hi-C Data Analysis Pipeline Optimization',
      hypothesis: 'GPU-accelerated processing will reduce Hi-C analysis time by 70% while maintaining accuracy.',
      method: `1. Implement CUDA kernels for contact matrix normalization
2. Parallelize iterative correction (ICE)
3. Benchmark on datasets of 1M-10M contacts
4. Compare CPU vs GPU runtimes`,
      observations: 'GPU speedup evident, but memory bandwidth limits scaling beyond 4GB datasets.',
      results: `Runtime reduction: 68% for 5M contacts
Memory usage: 2.5GB (optimized)
Accuracy preserved (Pearson correlation >0.99).`,
      status: 'IN_PROGRESS',
      authorId: user5.id,
      teamId: bioTeam.id,
      tags: {
        connect: [{ id: dataTag.id }, { id: genomicsTag.id }],
      },
    },
  });

  const exp8 = await prisma.experiment.create({
    data: {
      title: 'VQE for Hydrogen Molecule Simulation',
      hypothesis: 'VQE with UCCSD ansatz can accurately compute ground state energy of H2 within chemical accuracy.',
      method: `1. Use Qiskit Aer simulator
2. 4-qubit system for H2 at 0.74 Å bond length
3. Optimize with COBYLA algorithm
4. Target chemical accuracy: 1.6 mHa`,
      observations: 'Convergence achieved, but noise simulation shows degradation.',
      results: `Energy error: 0.8 mHa (below threshold)
Iterations: 45
Fidelity: 0.97 on noisy simulator.`,
      nextSteps: 'Test on real hardware. Scale to larger molecules like LiH.',
      status: 'COMPLETE',
      authorId: user3.id,
      teamId: quantumTeam.id,
      tags: {
        connect: [{ id: quantumTag.id }, { id: simulationTag.id }],
      },
    },
  });

  const exp9 = await prisma.experiment.create({
    data: {
      title: 'Quantum Error Correction Benchmarking',
      hypothesis: 'Surface code with d=5 will suppress logical error rates below 10^-3 for 1000 cycles.',
      method: `1. Simulate surface code on 49-qubit lattice
2. Apply depolarizing noise model (p=0.01)
3. Decode with minimum-weight perfect matching
4. Measure logical X and Z error rates`,
      observations: 'Threshold behavior observed around p=0.011.',
      status: 'BLOCKED',
      authorId: user4.id,
      teamId: quantumTeam.id,
      tags: {
        connect: [{ id: quantumTag.id }],
      },
    },
  });

  const exp10 = await prisma.experiment.create({
    data: {
      title: 'Federated Learning for Privacy-Preserving Genomics',
      hypothesis: 'Federated averaging across institutions will match centralized model performance without data sharing.',
      method: `1. Simulate 5 institutions with genomic variant data
2. Use FedAvg with secure aggregation
3. Train logistic regression for disease risk prediction
4. Evaluate on held-out cohorts`,
      observations: 'Communication rounds dominate runtime; compression needed.',
      results: `AUC: 0.87 (vs 0.89 centralized)
Rounds: 120 to convergence
Privacy leakage < epsilon=1.0.`,
      failures: 'Non-IID data distribution caused slower convergence.',
      nextSteps: 'Implement FedProx for heterogeneous data. Add differential privacy.',
      status: 'IN_PROGRESS',
      authorId: user6.id,
      teamId: bioTeam.id,
      tags: {
        connect: [{ id: mlTag.id }, { id: genomicsTag.id }],
      },
    },
  });

  const exp11 = await prisma.experiment.create({
    data: {
      title: 'PPO for Robotic Arm Control',
      hypothesis: 'PPO will enable stable learning of complex manipulation tasks in simulation.',
      method: `1. Use MuJoCo environment for FetchReach
2. PPO with GAE(lambda=0.95)
3. Train for 1M timesteps
4. Evaluate success rate over 50 episodes`,
      observations: 'Policy learns quickly but plateaus due to exploration limits.',
      results: `Success rate: 85%
Average reward:  -2.1 (improved from -10 baseline)
Episode length: 50 steps average.`,
      failures: 'Overestimation of value function led to premature convergence.',
      nextSteps: 'Incorporate Hindsight Experience Replay. Transfer to real robot.',
      status: 'COMPLETE',
      authorId: user7.id,
      teamId: roboticsTeam.id,
      tags: {
        connect: [{ id: rlTag.id }, { id: roboticsTag.id }],
      },
    },
  });

  const exp12 = await prisma.experiment.create({
    data: {
      title: 'Bias Detection in Demographic-Free Fairness',
      hypothesis: 'Proxy-based fairness constraints will reduce disparate impact without demographic data.',
      method: `1. Use Adult UCI dataset with proxy features
2. Train logistic regression with calibration loss
3. Measure demographic parity via proxies
4. Compare to standard ERM baseline`,
      observations: 'Proxies capture 70% of true demographic signal.',
      results: `Disparity: 0.12 (vs 0.28 baseline)
Accuracy: 84.2% (minor drop)
Calibration error: 0.05.`,
      status: 'IN_PROGRESS',
      authorId: user9.id,
      teamId: ethicsTeam.id,
      tags: {
        connect: [{ id: fairnessTag.id }, { id: privacyTag.id }],
      },
    },
  });

  const exp13 = await prisma.experiment.create({
    data: {
      title: 'LIME Explanations for Image Classifiers',
      hypothesis: 'LIME will provide interpretable explanations for CNN predictions on CIFAR-10.',
      method: `1. Train ResNet-20 on CIFAR-10
2. Generate LIME explanations for 1000 test images
3. Human evaluation on faithfulness (1-5 scale)
4. Compare to Grad-CAM heatmaps`,
      observations: 'LIME segments are intuitive but computationally intensive.',
      results: `Faithfulness score: 4.2/5
Explanation time: 2.5s per image
User preference: 62% over Grad-CAM.`,
      nextSteps: 'Optimize for real-time use. Test on medical images.',
      status: 'COMPLETE',
      authorId: user10.id,
      teamId: ethicsTeam.id,
      tags: {
        connect: [{ id: explainabilityTag.id }, { id: cvTag.id }],
      },
    },
  });

  const exp14 = await prisma.experiment.create({
    data: {
      title: 'YOLOv4 Deployment on Edge Devices',
      hypothesis: 'YOLOv4 with TensorRT will achieve real-time detection on Jetson Nano.',
      method: `1. Convert YOLOv4 to ONNX
2. Optimize with TensorRT FP16
3. Test on COCO val set
4. Measure FPS and mAP`,
      observations: 'Quantization reduces accuracy slightly but boosts speed.',
      results: `FPS: 28 on Jetson Nano
mAP: 42.1% (vs 43.5% full precision)
Latency: 35ms per frame.`,
      failures: 'Memory overflow on batch size >1; fixed with dynamic shapes.',
      nextSteps: 'Integrate with ROS for robotic perception.',
      status: 'BLOCKED',
      authorId: user8.id,
      teamId: roboticsTeam.id,
      tags: {
        connect: [{ id: cvTag.id }, { id: roboticsTag.id }],
      },
    },
  });

  const exp15 = await prisma.experiment.create({
    data: {
      title: 'Few-Shot Prompting with GPT-3 for Code Generation',
      hypothesis: 'Few-shot prompts will enable GPT-3 to generate functional Python code snippets.',
      method: `1. Use davinci model with 5-shot prompts
2. Test on HumanEval dataset (164 problems)
3. Measure pass@1 and pass@10
4. Compare to zero-shot`,
      observations: 'Model excels at simple functions but struggles with edge cases.',
      results: `pass@1: 28.5%
pass@10: 45.2%
Zero-shot: 12.3%`,
      status: 'IN_PROGRESS',
      authorId: user1.id,
      teamId: aiTeam.id,
      tags: {
        connect: [{ id: nlpTag.id }, { id: mlTag.id }],
      },
    },
  });

  const exp16 = await prisma.experiment.create({
    data: {
      title: 'scikit-learn Pipeline for Genomic Feature Selection',
      hypothesis: 'Recursive feature elimination will identify top 100 biomarkers from 20k features.',
      method: `1. Use TCGA breast cancer data
2. RFE with RandomForestClassifier
3. Cross-validate with 5-fold CV
4. Evaluate AUC on held-out set`,
      observations: 'Feature importance correlates with biological pathways.',
      results: `AUC: 0.92
Top features: HER2, TP53 mutations
Runtime: 45 min on CPU`,
      nextSteps: 'Integrate with pathway analysis tools like GSEA.',
      status: 'COMPLETE',
      authorId: user6.id,
      teamId: bioTeam.id,
      tags: {
        connect: [{ id: dataTag.id }, { id: genomicsTag.id }],
      },
    },
  });

  const exp17 = await prisma.experiment.create({
    data: {
      title: 'QAOA for MaxCut on Small Graphs',
      hypothesis: 'QAOA with p=2 layers will approximate MaxCut within 5% of optimal.',
      method: `1. Test on 20-vertex graphs from GSET
2. Optimize with SPSA
3. Compare to Goemans-Williamson SDP
4. Average approximation ratio over 50 instances`,
      observations: 'Layer depth p=2 sufficient for small graphs.',
      results: `Approx ratio: 0.95 (95% of optimal)
Runtime: 10s per graph on simulator
Classical SDP: 0.97`,
      failures: 'Local minima in parameter space; multiple initializations needed.',
      nextSteps: 'Scale to 50 vertices. Test on real quantum hardware.',
      status: 'IN_PROGRESS',
      authorId: user3.id,
      teamId: quantumTeam.id,
      tags: {
        connect: [{ id: quantumTag.id }, { id: optimizationTag.id }],
      },
    },
  });

  const exp18 = await prisma.experiment.create({
    data: {
      title: 'Differential Privacy in Federated Learning',
      hypothesis: 'Adding DP noise to gradients will preserve privacy without degrading model accuracy >5%.',
      method: `1. MNIST federated setup with 10 clients
2. DP-SGD with sigma=1.0
3. Train for 100 rounds
4. Measure epsilon and accuracy`,
      observations: 'Noise level affects convergence speed.',
      results: `Accuracy: 96.2% (vs 98.1% non-private)
Epsilon: 8.3
Privacy budget spent: 0.5 per round.`,
      status: 'COMPLETE',
      authorId: user9.id,
      teamId: ethicsTeam.id,
      tags: {
        connect: [{ id: privacyTag.id }, { id: mlTag.id }],
      },
    },
  });

  const exp19 = await prisma.experiment.create({
    data: {
      title: 'Multi-Agent RL for Traffic Simulation',
      hypothesis: 'MARL with centralized training will reduce average delay in intersection control.',
      method: `1. Use SUMO for 4-way intersection
2. QMIX algorithm with 8 agents
3. Train for 1M episodes
4. Compare to fixed-time traffic lights`,
      observations: 'Agents learn cooperative policies after 200k episodes.',
      results: `Avg delay: 12s (vs 25s baseline)
Throughput: +18%
Safety violations: 0`,
      nextSteps: 'Scale to grid network. Incorporate human drivers.',
      status: 'BLOCKED',
      authorId: user7.id,
      teamId: roboticsTeam.id,
      tags: {
        connect: [{ id: rlTag.id }, { id: simulationTag.id }],
      },
    },
  });

  const exp20 = await prisma.experiment.create({
    data: {
      title: 'Adversarial Robustness of LLMs',
      hypothesis: 'Fine-tuning with adversarial examples will improve robustness to prompt attacks.',
      method: `1. Use GPT-2 small
2. Generate adversarial prompts via GCG
3. Fine-tune on clean + adv dataset
4. Test attack success rate on held-out prompts`,
      observations: 'Adversarial training reduces toxicity but slows convergence.',
      results: `Attack success: 15% (vs 65% baseline)
Perplexity: 22.1 (minor increase)
Toxicity score: -0.3`,
      failures: 'Overfitting to specific attack patterns.',
      nextSteps: 'Test on larger models. Evaluate human-judged safety.',
      status: 'IN_PROGRESS',
      authorId: user4.id,
      teamId: aiTeam.id,
      tags: {
        connect: [{ id: nlpTag.id }, { id: ethicsTag.id }],
      },
    },
  });

  console.log('✅ Created 20 experiments');

  // Link papers to experiments
  await prisma.experimentPaper.create({
    data: { experimentId: exp1.id, paperId: paper2.id },
  });
  await prisma.experimentPaper.create({
    data: { experimentId: exp2.id, paperId: paper3.id },
  });
  await prisma.experimentPaper.create({
    data: { experimentId: exp2.id, paperId: paper1.id },
  });
  await prisma.experimentPaper.create({
    data: { experimentId: exp6.id, paperId: paper4.id },
  });
  await prisma.experimentPaper.create({
    data: { experimentId: exp7.id, paperId: paper6.id },
  });
  await prisma.experimentPaper.create({
    data: { experimentId: exp8.id, paperId: paper7.id },
  });
  await prisma.experimentPaper.create({
    data: { experimentId: exp8.id, paperId: paper5.id },
  });
  await prisma.experimentPaper.create({
    data: { experimentId: exp9.id, paperId: paper5.id },
  });
  await prisma.experimentPaper.create({
    data: { experimentId: exp10.id, paperId: paper6.id },
  });
  await prisma.experimentPaper.create({
    data: { experimentId: exp11.id, paperId: paper8.id },
  });
  await prisma.experimentPaper.create({
    data: { experimentId: exp12.id, paperId: paper9.id },
  });
  await prisma.experimentPaper.create({
    data: { experimentId: exp13.id, paperId: paper10.id },
  });
  await prisma.experimentPaper.create({
    data: { experimentId: exp14.id, paperId: paper11.id },
  });
  await prisma.experimentPaper.create({
    data: { experimentId: exp15.id, paperId: paper12.id },
  });
  await prisma.experimentPaper.create({
    data: { experimentId: exp16.id, paperId: paper13.id },
  });
  await prisma.experimentPaper.create({
    data: { experimentId: exp17.id, paperId: paper14.id },
  });
  await prisma.experimentPaper.create({
    data: { experimentId: exp18.id, paperId: paper15.id },
  });
  await prisma.experimentPaper.create({
    data: { experimentId: exp19.id, paperId: paper8.id },
  });
  await prisma.experimentPaper.create({
    data: { experimentId: exp20.id, paperId: paper12.id },
  });
  await prisma.experimentPaper.create({
    data: { experimentId: exp4.id, paperId: paper11.id },
  });
  await prisma.experimentPaper.create({
    data: { experimentId: exp5.id, paperId: paper12.id },
  });

  console.log('✅ Linked papers to experiments (22 links)');

  // Create comments
  await prisma.comment.createMany({
    data: [
      {
        content: 'Great results! Have you tried EfficientNet as well? It might give better accuracy with less parameters.',
        experimentId: exp1.id,
        authorId: user2.id,
      },
      {
        content: 'The data augmentation strategy looks solid. Did you use any normalization specific to medical images?',
        experimentId: exp1.id,
        authorId: user3.id,
      },
      {
        content: '@alice Could you share the training logs? I want to see the loss curves.',
        experimentId: exp1.id,
        authorId: user2.id,
        mentions: [user1.id],
      },
      {
        content: 'For the rare disease classes, maybe we can use focal loss instead of cross-entropy?',
        experimentId: exp1.id,
        authorId: user1.id,
      },
      {
        content: 'The ROUGE scores look good! Have you tried T5 for comparison?',
        experimentId: exp2.id,
        authorId: user1.id,
      },
      {
        content: 'What is blocking this experiment? Need any help?',
        experimentId: exp3.id,
        authorId: user3.id,
      },
      {
        content: 'Blocked on GPU availability. The queue is 2 days long.',
        experimentId: exp3.id,
        authorId: user1.id,
      },
      {
        content: 'ViT is indeed promising for geospatial data. Did you experiment with self-supervised pretraining on unlabeled satellite images?',
        experimentId: exp4.id,
        authorId: user4.id,
      },
      {
        content: 'CLIP\'s zero-shot capabilities are impressive. How does it compare to GPT-4V on the same task?',
        experimentId: exp5.id,
        authorId: user6.id,
        mentions: [user1.id],
      },
      {
        content: 'AlphaFold fine-tuning worked well! The TM-score improvement is significant. Any plans to release the fine-tuned weights?',
        experimentId: exp6.id,
        authorId: user5.id,
      },
      {
        content: 'GPU acceleration for Hi-C is crucial. Have you integrated this with Juicer or HiCExplorer tools?',
        experimentId: exp7.id,
        authorId: user2.id,
      },
      {
        content: '@prof.chen The VQE results are spot on. Excited to see the LiH scaling experiment!',
        experimentId: exp8.id,
        authorId: user4.id,
        mentions: [user3.id],
      },
      {
        content: 'Error correction is the bottleneck for NISQ devices. What decoder are you using for the surface code?',
        experimentId: exp9.id,
        authorId: user6.id,
      },
      {
        content: 'Federated learning in genomics is timely with privacy regulations. Did you test against model poisoning attacks?',
        experimentId: exp10.id,
        authorId: user1.id,
      },
      {
        content: 'This could be extended to multi-omics data. Great work @charlie!',
        experimentId: exp10.id,
        authorId: user5.id,
        mentions: [user6.id],
      },
      {
        content: 'PPO is a solid choice for robotics. Have you tried SAC for continuous actions?',
        experimentId: exp11.id,
        authorId: user8.id,
      },
      {
        content: 'Proxy fairness is innovative. How robust is it to proxy inaccuracies?',
        experimentId: exp12.id,
        authorId: user10.id,
        mentions: [user9.id],
      },
      {
        content: 'LIME explanations are user-friendly. Did you measure deletion/insertion stability?',
        experimentId: exp13.id,
        authorId: user1.id,
      },
      {
        content: 'Edge deployment is key for robotics. What about power consumption on Jetson?',
        experimentId: exp14.id,
        authorId: user7.id,
      },
      {
        content: '@alice GPT-3 few-shot is powerful, but watch for hallucinations in code.',
        experimentId: exp15.id,
        authorId: user2.id,
        mentions: [user1.id],
      },
      {
        content: 'Feature selection via RFE is efficient. Any biological validation of top features?',
        experimentId: exp16.id,
        authorId: user5.id,
      },
      {
        content: 'QAOA shows promise for optimization. Try warm-starting with classical heuristics.',
        experimentId: exp17.id,
        authorId: user4.id,
      },
      {
        content: 'DP in FL is essential. What epsilon do you target for production?',
        experimentId: exp18.id,
        authorId: user6.id,
      },
      {
        content: 'MARL for traffic is exciting. Have you simulated heterogeneous vehicle types?',
        experimentId: exp19.id,
        authorId: user7.id,
      },
      {
        content: 'Adversarial robustness for LLMs is critical. Great setup!',
        experimentId: exp20.id,
        authorId: user9.id,
      },
      {
        content: 'Consider red-teaming with diverse prompts.',
        experimentId: exp20.id,
        authorId: user3.id,
      },
    ],
  });

  console.log('✅ Created 26 comments');

  console.log('✅ Created 15 code versions');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📧 Test accounts:');
  console.log('   alice@research.edu / password123');
  console.log('   bob@research.edu / password123');
  console.log('   prof.chen@research.edu / password123');
  console.log('   diana@research.edu / password123');
  console.log('   prof.lee@research.edu / password123');
  console.log('   charlie@research.edu / password123');
  console.log('   eve@research.edu / password123');
  console.log('   frank@research.edu / password123');
  console.log('   prof.garcia@research.edu / password123');
  console.log('   grace@research.edu / password123');
}

main()
  .catch((e) => {
    console.error(e);
    // @ts-ignore
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });