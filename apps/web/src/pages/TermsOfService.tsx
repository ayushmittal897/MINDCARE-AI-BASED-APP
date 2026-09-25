import { FileText } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 pb-32">
      <div className="mb-8 flex items-center gap-3">
        <FileText className="h-8 w-8 text-indigo-600" />
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Terms of Service</h1>
      </div>
      
      <div className="prose prose-indigo dark:prose-invert max-w-none">
        <p className="text-gray-500 italic">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/30 p-4 border border-yellow-200 dark:border-yellow-800 mb-8">
          <h3 className="text-yellow-800 dark:text-yellow-300 font-semibold mt-0 mb-2">Medical Disclaimer</h3>
          <p className="text-yellow-700 dark:text-yellow-400 mb-0">
            <strong>This app is a screening and demonstration tool, is NOT a medical diagnosis, and is NOT a substitute for consultation with a licensed mental health professional.</strong> If you are in crisis or need immediate assistance, please contact your local emergency services or a mental health crisis hotline.
          </p>
        </div>
        
        <h2>1. Agreement to Terms</h2>
        <p>
          By viewing or using this application, you agree to be bound by these Terms of Service. If you do not agree with all of these terms, you are prohibited from using the application.
        </p>

        <h2>2. Nature of the Application</h2>
        <p>
          MindCare is a portfolio project intended to demonstrate software engineering and artificial intelligence capabilities. It is <strong>not</strong> a certified medical device, and the insights generated are for informational and demonstration purposes only.
        </p>

        <h2>3. User Data</h2>
        <p>
          You retain all rights to any data you submit to the application. By submitting data, you grant us a license to process it solely for the purpose of generating the application's outputs. You may request deletion of your data at any time via the application settings.
        </p>

        <h2>4. Limitations of Liability</h2>
        <p>
          In no event shall the creators of this application be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on this application.
        </p>

        <h2>5. Intellectual Property</h2>
        <p>
          The code and proprietary concepts behind this specific implementation of MindCare are protected by copyright. See the LICENSE file in the repository root for more details.
        </p>
      </div>
    </div>
  );
}
