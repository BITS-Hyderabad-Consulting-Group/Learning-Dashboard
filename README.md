# Learning Dashboard

An interactive and intuitive Learning Management System (LMS) developed by the tech minds of BITS Hyderabad Consulting Group (BHCG). Designed for the next-gen learner, built for scale.

## 🚀 Overview

This platform allows instructors to create rich, multi-week courses with various module types, including articles, videos, and interactive quizzes. Students can enroll in courses, track their progress granularly, earn experience points (XP) and badges, and submit assignments through a secure file upload system.

## ✨ Key Features

-   **User Authentication**: Secure sign-up and login using Supabase Google Authentication.
-   **Course Management**: Full CRUD (Create, Read, Update, Delete) functionality for instructors to manage courses, weeks, and modules.
-   **Interactive Modules**: Supports different content types like Markdown articles, YouTube video embeds, and quizzes.
-   **Granular Progress Tracking**: Monitors completion status for every single module, providing users with a clear sense of accomplishment.
-   **Quiz System**: Supports both Multiple-Choice Questions (MCQ) and file-upload submissions.
-   **Gamification**: A system for awarding XP and badges to keep users motivated.
-   **Secure File Uploads**: Direct-to-cloud (Firebase) file uploads for quiz submissions, ensuring security and scalability.
-   **Role-Based Access Control**: Differentiates between `student`, `instructor`, and `admin` roles.

## 🛠️ Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Animations**: [Framer Motion](https://motion.dev/)
-   **Database + ORM**: [Supabase](https://supabase.com/)
-   **File Storage**: [Google Firebase](https://firebase.google.com/)

## 🙏 Credits

A cross-functional team of designers and developers from BITS Hyderabad Consulting Group, led by the Tech & Design Lead, Aravind Sathesh, combining design precision with engineering excellence.

### 🎨 Design Team

-   Aryan Saini
-   Arjun Rathore
-   Garima Dwivedi
-   Rithvik Vallivedu

### 💻 Tech Team

-   Anand Venkataraman
-   Arpit Kudre
-   B Rushil Mohan
-   Sashidhar Naidu
-   Vedant Nichal
-   Vindaksh C M Reddy
-   Yashvi A

## 🔄 Supabase keepalive

Free-tier Supabase projects are paused after 7 days without activity. Three
things keep this one awake:

1.  **`keepalive/` folder** — drop any file in it (image, doc, anything) and
    push. On every deploy `npm run keepalive:sync` uploads the folder to the
    private `keepalive` Storage bucket (creating it on first run) and reads from
    the database. The Netlify build command runs it before `next build`, and it
    never fails the build if Supabase is unreachable.
2.  **Hidden page at `/k/<KEEPALIVE_SECRET>`** — lists those files as small
    thumbnails. Every visit writes a `visits.txt` heartbeat to storage and reads
    from the database, so simply opening the page is enough of a ping. Any other
    path under `/k/` 404s, the page is `noindex` and skipped by the middleware.
3.  **Scheduled ping** — `.github/workflows/supabase-keepalive.yml` calls
    `/api/keepalive` every 3 days (and on manual dispatch), covering stretches
    with no deploys and no visitors. Override the target with a repository
    variable `KEEPALIVE_URL` if the site moves. Note that GitHub disables cron
    workflows after 60 days with no repository activity, so the folder and the
    page above remain the belt-and-braces backup.

Set `KEEPALIVE_SECRET` to a long random string in the Netlify environment (and
in `.env.local` for local use). Without it the page 404s for everyone.

## 🤝 Contributing

Contributions are welcome! Please open an issue to discuss what you would like to change or submit a pull request.

## 📄 License

This project is licensed under the MIT License. See the [`LICENSE`](./LICENSE) file for details.
