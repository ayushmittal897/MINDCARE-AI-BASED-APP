import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 pb-32">
      <div className="mb-8 flex items-center gap-3">
        <Shield className="h-8 w-8 text-indigo-600" />
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Privacy Policy</h1>
      </div>
      
      <div className="prose prose-indigo dark:prose-invert max-w-none">
        <p className="text-gray-500 italic">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2>1. Introduction</h2>
        <p>
          Welcome to MindCare. We are committed to protecting your personal information and your right to privacy. 
          This Privacy Policy applies to all information collected through our application.
        </p>
        <p>
          <strong>Disclaimer:</strong> This application is a portfolio project and demonstration tool. It is not intended for official medical data storage or diagnosis.
        </p>

        <h2>2. Information We Collect</h2>
        <p>
          We collect personal information that you voluntarily provide to us when you register on the application, 
          express an interest in obtaining information about us or our products and Services, when you participate in 
          activities on the application (such as mental health assessments), or otherwise when you contact us.
        </p>
        <ul>
          <li><strong>Personal Information Provided by You:</strong> We collect email addresses, names, and passwords (if applicable).</li>
          <li><strong>Health and Assessment Data:</strong> If you use the assessment features, we collect your responses and biometric indicators solely to generate insights.</li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <p>
          We process your information for purposes based on legitimate business interests, the fulfillment of our contract with you, compliance with our legal obligations, and/or your consent. Specifically, we use it to:
        </p>
        <ul>
          <li>Facilitate account creation and logon process.</li>
          <li>Generate mental health screening insights and reports based on your session data.</li>
          <li>Improve the functionality of the demonstration application.</li>
        </ul>

        <h2>4. Your Privacy Rights & Data Deletion</h2>
        <p>
          You have the right to request access to the personal information we collect from you, change that information, or delete it in some circumstances. You can request complete removal of your session metadata and embeddings via the Settings page of this application.
        </p>

        <h2>5. Contact Us</h2>
        <p>
          If you have questions or comments about this notice, you may email the repository owner or submit an issue on the GitHub repository.
        </p>
      </div>
    </div>
  );
}
