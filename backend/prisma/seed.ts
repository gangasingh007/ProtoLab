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

  console.log('✅ Created 3 users');

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
        ],
      },
    },
  });

  console.log('✅ Created 2 teams');

  // Create tags
  const mlTag = await prisma.tag.create({ data: { name: 'Machine Learning' } });
  const cvTag = await prisma.tag.create({ data: { name: 'Computer Vision' } });
  const nlpTag = await prisma.tag.create({ data: { name: 'NLP' } });
  const dataTag = await prisma.tag.create({ data: { name: 'Data Analysis' } });

  console.log('✅ Created tags');

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

  console.log('✅ Created 3 papers');

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

  console.log('✅ Created 5 experiments');

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

  console.log('✅ Linked papers to experiments');

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
    ],
  });

  console.log('✅ Created comments');

  // Create code versions
  await prisma.codeVersion.createMany({
    data: [
      {
        commitHash: 'a3f4b21',
        branch: 'main',
        repoUrl: 'https://github.com/ailab/medical-imaging',
        environment: JSON.stringify({
          python: '3.9',
          torch: '2.0.0',
          torchvision: '0.15.0',
          cuda: '11.8',
        }),
        experimentId: exp1.id,
      },
      {
        commitHash: '7c8d912',
        branch: 'feature/augmentation',
        repoUrl: 'https://github.com/ailab/medical-imaging',
        environment: JSON.stringify({
          python: '3.9',
          torch: '2.0.0',
          albumentations: '1.3.0',
        }),
        experimentId: exp3.id,
      },
    ],
  });

  console.log('✅ Created code versions');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📧 Test accounts:');
  console.log('   alice@research.edu / password123');
  console.log('   bob@research.edu / password123');
  console.log('   prof.chen@research.edu / password123');
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
}