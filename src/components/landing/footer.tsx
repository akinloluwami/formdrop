import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-100 py-12 bg-white">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-accent rounded-md flex items-center justify-center text-white">
            <Zap size={14} fill="currentColor" />
          </div>
          <span className="font-bold text-gray-900">FormDrop</span>
        </div>
        <div className="flex gap-8 text-sm text-gray-500">
          <a href="/pricing" className="hover:text-gray-900">
            Pricing
          </a>
          <a href="/docs" className="hover:text-gray-900">
            Documentation
          </a>
          <a href="/terms" className="hover:text-gray-900">
            Terms
          </a>
          <a href="/privacy" className="hover:text-gray-900">
            Privacy
          </a>
        </div>
        <div className="text-sm text-gray-400">
          © {new Date().getFullYear()} FormDrop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
