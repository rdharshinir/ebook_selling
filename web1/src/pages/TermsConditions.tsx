export default function TermsConditions() {
  return (
    <div className="font-sans text-slate-800 bg-white min-h-screen pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-[#1E3A5F] mb-8">Terms and Conditions</h1>
        <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <h2 className="text-2xl font-bold text-[#1E3A5F] mt-8">1. Acceptance of Terms</h2>
          <p>
            By accessing and using vihaanflow.ai (the "Website") and the services provided by Vihaanflow AI ("Services"), 
            you accept and agree to be bound by the terms and provision of this agreement. 
            If you do not agree to abide by these terms, please do not use our Services.
          </p>

          <h2 className="text-2xl font-bold text-[#1E3A5F] mt-8">2. Description of Services</h2>
          <p>
            Vihaanflow AI provides AI chatbot integration and automation services primarily connecting Meta Ads, 
            WhatsApp APIs, and Groq APIs for businesses. We reserve the right to modify or discontinue, 
            temporarily or permanently, the Services with or without notice to you.
          </p>

          <h2 className="text-2xl font-bold text-[#1E3A5F] mt-8">3. User Responsibilities</h2>
          <p>
            You agree to use the Services only for lawful purposes and in accordance with these Terms. You agree not to use the Services:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>In any way that violates any applicable national or international law or regulation.</li>
            <li>To send, knowingly receive, upload, download, use, or re-use any material that does not comply with these Terms.</li>
            <li>To transmit, or procure the sending of, any advertising or promotional material without our prior written consent.</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#1E3A5F] mt-8">4. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are and will remain the exclusive property of 
            Vihaanflow AI and its licensors. The Service is protected by copyright, trademark, and other laws of both the 
            India and foreign countries.
          </p>

          <h2 className="text-2xl font-bold text-[#1E3A5F] mt-8">5. Third-Party Integrations</h2>
          <p>
            Our Services heavily rely on third-party APIs (such as WhatsApp API providers and Groq). 
            We are not responsible for any downtime, API changes, or suspension of service initiated by these third parties. 
            You must comply with the terms of service of any third-party providers you integrate with through our platform.
          </p>

          <h2 className="text-2xl font-bold text-[#1E3A5F] mt-8">6. Limitation of Liability</h2>
          <p>
            In no event shall Vihaanflow AI, nor its directors, employees, partners, agents, suppliers, or affiliates, 
            be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, 
            loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or 
            inability to access or use the Service.
          </p>
        </div>
      </div>
    </div>
  );
}
