export default function PrivacyPolicy() {
  return (
    <div className="font-sans text-slate-800 bg-white min-h-screen pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-[#1E3A5F] mb-8">Privacy Policy</h1>
        <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-bold text-[#1E3A5F] mt-8">1. Introduction</h2>
          <p>
            Vihaanflow AI ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. 
            This privacy policy will inform you as to how we look after your personal data when you visit our website 
            and tell you about your privacy rights and how the law protects you.
          </p>

          <h2 className="text-2xl font-bold text-[#1E3A5F] mt-8">2. The Data We Collect About You</h2>
          <p>
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers (such as WhatsApp).</li>
            <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
            <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#1E3A5F] mt-8">3. How We Use Your Personal Data</h2>
          <p>
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal obligation.</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#1E3A5F] mt-8">4. Data Security</h2>
          <p>
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, 
            used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data 
            to those employees, agents, contractors and other third parties who have a business need to know.
          </p>

          <h2 className="text-2xl font-bold text-[#1E3A5F] mt-8">5. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our privacy practices, please contact us at:
            <br />
            Email: hello@vihaanflow.ai
            <br />
            Phone: +91 73393 66166
          </p>
        </div>
      </div>
    </div>
  );
}
