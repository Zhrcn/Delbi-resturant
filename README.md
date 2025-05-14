# Delbi Restaurant Website

A modern restaurant website built with Next.js, React, and Tailwind CSS. Features include a responsive design, online reservation system, admin dashboard, and Google Analytics integration.

## Features

- 🎨 Modern and responsive design
- 📱 Mobile-first approach
- 🍽️ Online reservation system
- 📊 Admin dashboard with analytics
- 🔒 Secure authentication
- 📈 Google Analytics integration
- 🍪 Cookie consent management
- 🛡️ Anti-spam protection for reservations

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- Google Analytics account (for analytics)
- Combell hosting account (for deployment)

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/delbi-restaurant.git
cd delbi-restaurant
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory and add your environment variables:
```env
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Combell

1. Build the project:
```bash
npm run build
# or
yarn build
```

2. Configure your Combell hosting:
   - Set up SSL certificate
   - Configure domain settings
   - Set up Node.js environment

3. Deploy the built files to your Combell hosting:
   - Upload the contents of the `.next` directory
   - Configure the server to run `npm start`

## Admin Access

Default admin credentials:
- Username: admin
- Password: admin123

**Important:** Change these credentials in production!

## Project Structure

```
delbi-restaurant/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/         # Next.js pages
│   ├── styles/        # Global styles
│   └── utils/         # Utility functions
├── public/            # Static assets
└── ...
```

## Security Features

- Protected admin routes
- Anti-spam measures for reservations
- Cookie consent management
- Form validation
- Rate limiting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@delbi.com or create an issue in the repository.
