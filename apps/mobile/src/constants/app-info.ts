export const appInfo = {
  name: 'CodeReviewPilot AI',
  version: '0.1.0',
  developerName: 'Jakapan Kanta',
  releaseNotes: {
    en: [
      {
        version: '0.1.0',
        date: '2026-05-15',
        title: 'Security, product polish, and app information',
        items: [
          'Added GitHub username allowlist to restrict who can create app sessions.',
          'Added backend rate limiting, including stricter throttling for AI review generation.',
          'Added release notes, app version, and developer information to the Home screen.',
          'Added a shared app header with theme, language, and history shortcuts on every screen.',
          'Improved AI review Markdown rendering for inline code and code blocks.'
        ]
      },
      {
        version: '0.0.4',
        date: '2026-05-14',
        title: 'Local development authentication',
        items: [
          'Added Local GitHub CLI Auth for development machines that already use gh auth.',
          'Added login method selector for OAuth, fine-grained PAT, and Local CLI.',
          'Added manual light, dark, and system theme switching.',
          'Improved private repository error messages for OAuth restrictions, SSO, and PAT permissions.'
        ]
      },
      {
        version: '0.0.3',
        date: '2026-05-14',
        title: 'Review reliability improvements',
        items: [
          'Made AI review parsing tolerant of incomplete model output.',
          'Added clearer backend errors when OpenAI generation or JSON formatting fails.',
          'Normalized review issues so missing severity or recommendation fields still render safely.',
          'Added tests for AI review result normalization.'
        ]
      },
      {
        version: '0.0.2',
        date: '2026-05-13',
        title: 'Authentication and GitHub integration',
        items: [
          'Added GitHub OAuth login and encrypted GitHub token storage.',
          'Added fine-grained personal access token login for private repositories.',
          'Added GitHub PR URL parsing, validation, changed files, patches, and commits fetching.',
          'Added backend review history and local review history.'
        ]
      },
      {
        version: '0.0.1',
        date: '2026-05-13',
        title: 'Initial project foundation',
        items: [
          'Created the Expo React Native app for Android, iOS, and Web.',
          'Created the NestJS backend with auth, github, ai-review, history, and users modules.',
          'Added OpenAI-powered PR review generation with summary, issues, security, performance, and best practice sections.',
          'Added English and Thai localization plus GitHub-inspired dark and light UI foundations.'
        ]
      }
    ],
    th: [
      {
        version: '0.1.0',
        date: '2026-05-15',
        title: 'ความปลอดภัย ความเรียบร้อยของ UI และข้อมูลแอป',
        items: [
          'เพิ่ม GitHub username allowlist เพื่อจำกัดว่าใครสามารถสร้าง session เข้าใช้งานระบบได้',
          'เพิ่ม rate limit ฝั่ง backend รวมถึงจำกัดการเรียก AI review ให้เข้มขึ้น',
          'เพิ่ม Release Notes, App Version และ Developer บนหน้า Home',
          'เพิ่ม header กลางพร้อมปุ่มธีม ภาษา และประวัติบนทุกหน้า',
          'ปรับการแสดงผล Markdown ของ AI review ให้อ่าน inline code และ code block ง่ายขึ้น'
        ]
      },
      {
        version: '0.0.4',
        date: '2026-05-14',
        title: 'การยืนยันตัวตนสำหรับ local development',
        items: [
          'เพิ่ม Local GitHub CLI Auth สำหรับเครื่อง development ที่มี gh auth อยู่แล้ว',
          'เพิ่มตัวเลือกวิธี login ระหว่าง OAuth, fine-grained PAT และ Local CLI',
          'เพิ่มการสลับธีม Light, Dark และ System ด้วยตนเอง',
          'ปรับข้อความ error สำหรับ private repository, OAuth restrictions, SSO และ permission ของ PAT ให้ชัดขึ้น'
        ]
      },
      {
        version: '0.0.3',
        date: '2026-05-14',
        title: 'ปรับความเสถียรของผล review',
        items: [
          'ทำให้การ parse ผลลัพธ์จาก AI ทนต่อข้อมูลที่ model ส่งกลับมาไม่ครบ',
          'เพิ่ม error message ฝั่ง backend ให้ชัดขึ้นเมื่อ OpenAI หรือ JSON format มีปัญหา',
          'normalize review issue เพื่อให้รายการที่ไม่มี severity หรือ recommendation ยังแสดงผลได้ปลอดภัย',
          'เพิ่ม test สำหรับการ normalize ผลลัพธ์ AI review'
        ]
      },
      {
        version: '0.0.2',
        date: '2026-05-13',
        title: 'ระบบยืนยันตัวตนและ GitHub integration',
        items: [
          'เพิ่ม GitHub OAuth login และการเก็บ GitHub token แบบ encrypted',
          'เพิ่มการ login ด้วย fine-grained personal access token สำหรับ private repository',
          'เพิ่มการ parse และ validate GitHub PR URL รวมถึงดึง changed files, patches และ commits',
          'เพิ่ม review history ทั้งฝั่ง backend และ local device'
        ]
      },
      {
        version: '0.0.1',
        date: '2026-05-13',
        title: 'วางโครงสร้างเริ่มต้นของโปรเจ็ค',
        items: [
          'สร้าง Expo React Native app ที่รองรับ Android, iOS และ Web',
          'สร้าง NestJS backend พร้อม modules auth, github, ai-review, history และ users',
          'เพิ่มการสร้าง PR review ด้วย OpenAI พร้อม summary, issues, security, performance และ best practices',
          'เพิ่มภาษาอังกฤษ/ไทย และวางพื้นฐาน UI แบบ GitHub-inspired พร้อม dark/light mode'
        ]
      }
    ]
  }
};
