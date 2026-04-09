const Footer = () => {
  return (
    <footer className="mt-20 border-t border-white/10 bg-primary text-white">
      <div className="app-container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>

            <p className="mb-4 text-slate-300">Connecting clients with expert lawyers using modern legal technology.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-300 hover:text-white">Facebook</a>
              <a href="#" className="text-slate-300 hover:text-white">Twitter</a>
              <a href="#" className="text-slate-300 hover:text-white">LinkedIn</a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2 text-slate-300">
              <li><a href="/lawyers" className="hover:text-white">Find Lawyer</a></li>
              <li><a href="/articles" className="hover:text-white">Articles</a></li>
              <li><a href="/ai-assistant" className="hover:text-white">AI Assistant</a></li>
              <li><a href="/get-advice" className="hover:text-white">Legal Advice</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">Services</h4>
            <ul className="space-y-2 text-slate-300">
              <li><a href="/lawyers" className="hover:text-white">Lawyer Directory</a></li>
              <li><a href="/get-advice" className="hover:text-white">Advice Requests</a></li>
              <li><a href="/articles" className="hover:text-white">Knowledge Hub</a></li>
              <li><a href="/ai-assistant" className="hover:text-white">AI Research</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">Contact</h4>
            <p className="mb-2 text-slate-300">support@legaltech.com</p>
            <p className="mb-4 text-slate-300">+1 (555) 123-4567</p>
            <form className="space-y-2">
              <input type="email" placeholder="Your email" className="form-input rounded-full border-white/15 bg-white/95 py-2.5" />
              <button type="submit" className="btn-secondary w-full">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-8 text-center text-sm text-slate-400">
          Copyright 2026 LegalTech Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
