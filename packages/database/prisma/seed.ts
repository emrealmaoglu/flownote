/**
 * Database Seed Script
 * Populates database with initial data for development
 */

import { PrismaClient } from '../generated/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const passwordHash = await bcrypt.hash('demo123', 10);

  const demoUser = await prisma.user.upsert({
    where: { username: 'demo' },
    update: {},
    create: {
      username: 'demo',
      email: 'demo@flownote.app',
      passwordHash,
      name: 'Demo User',
      role: 'user',
      bio: 'Welcome to FlowNote! This is a demo account.',
    },
  });

  console.log('✅ Created demo user:', demoUser.username);

  // Create sample folders
  const personalFolder = await prisma.folder.upsert({
    where: { id: 'personal-folder-id' },
    update: {},
    create: {
      id: 'personal-folder-id',
      name: 'Personal',
      icon: '📝',
      color: '#3b82f6',
      userId: demoUser.id,
      position: 0,
    },
  });

  const workFolder = await prisma.folder.upsert({
    where: { id: 'work-folder-id' },
    update: {},
    create: {
      id: 'work-folder-id',
      name: 'Work',
      icon: '💼',
      color: '#8b5cf6',
      userId: demoUser.id,
      position: 1,
    },
  });

  console.log('✅ Created folders:', personalFolder.name, workFolder.name);

  // Create sample notes
  const welcomeNote = await prisma.note.upsert({
    where: { id: 'welcome-note-id' },
    update: {},
    create: {
      id: 'welcome-note-id',
      title: 'Welcome to FlowNote',
      content: JSON.stringify({
        blocks: [
          {
            id: 'block-1',
            type: 'heading',
            order: 0,
            data: { text: 'Welcome to FlowNote! 👋', level: 1 },
          },
          {
            id: 'block-2',
            type: 'text',
            order: 1,
            data: {
              text: 'FlowNote is a powerful, Notion-like note-taking application built with modern web technologies.',
            },
          },
          {
            id: 'block-3',
            type: 'heading',
            order: 2,
            data: { text: 'Features', level: 2 },
          },
          {
            id: 'block-4',
            type: 'checkbox',
            order: 3,
            data: { text: 'Block-based editor', checked: true },
          },
          {
            id: 'block-5',
            type: 'checkbox',
            order: 4,
            data: { text: 'Folder organization', checked: true },
          },
          {
            id: 'block-6',
            type: 'checkbox',
            order: 5,
            data: { text: 'Favorites system', checked: true },
          },
          {
            id: 'block-7',
            type: 'checkbox',
            order: 6,
            data: { text: 'Templates', checked: false },
          },
        ],
      }),
      iconEmoji: '👋',
      coverType: 'gradient',
      coverValue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      isFavorite: true,
      userId: demoUser.id,
      folderId: personalFolder.id,
      position: 0,
    },
  });

  console.log('✅ Created sample note:', welcomeNote.title);

  // Create sample template
  const meetingTemplate = await prisma.template.upsert({
    where: { id: 'meeting-template-id' },
    update: {},
    create: {
      id: 'meeting-template-id',
      name: 'Meeting Notes',
      description: 'Template for meeting notes with agenda and action items',
      icon: '📅',
      category: 'work',
      isPublic: true,
      content: JSON.stringify({
        blocks: [
          {
            id: 'template-block-1',
            type: 'heading',
            order: 0,
            data: { text: 'Meeting: [Topic]', level: 1 },
          },
          {
            id: 'template-block-2',
            type: 'text',
            order: 1,
            data: { text: '📅 Date: [Date]' },
          },
          {
            id: 'template-block-3',
            type: 'text',
            order: 2,
            data: { text: '👥 Attendees: [Names]' },
          },
          {
            id: 'template-block-4',
            type: 'heading',
            order: 3,
            data: { text: 'Agenda', level: 2 },
          },
          {
            id: 'template-block-5',
            type: 'checkbox',
            order: 4,
            data: { text: 'Topic 1', checked: false },
          },
          {
            id: 'template-block-6',
            type: 'heading',
            order: 5,
            data: { text: 'Action Items', level: 2 },
          },
          {
            id: 'template-block-7',
            type: 'checkbox',
            order: 6,
            data: { text: 'Action item 1', checked: false },
          },
        ],
      }),
      usageCount: 0,
    },
  });

  console.log('✅ Created template:', meetingTemplate.name);

  console.log('✨ Seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
