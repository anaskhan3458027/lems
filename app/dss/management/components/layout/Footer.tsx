// app/leave/management/components/layout/Footer.tsx
'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  FileText, 
  BarChart3, 
  Users, 
  HelpCircle, 
  Mail, 
  Phone, 
  Clock,
  ChevronRight,
  Shield,
  CheckCircle2
} from 'lucide-react';

export default function Footer() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const quickLinks = [
    { icon: Calendar, label: 'Apply for Leave', href: '#' },
    { icon: FileText, label: 'My Requests', href: '#' },
    { icon: Users, label: 'Team Calendar', href: '#' },
    { icon: BarChart3, label: 'Reports', href: '#' },
  ];

  const supportLinks = [
    { icon: HelpCircle, label: 'Help Center', href: '#' },
    { icon: FileText, label: 'Documentation', href: '#' },
    { icon: Shield, label: 'Leave Policies', href: '#' },
    { icon: Mail, label: 'Contact Support', href: '#' },
  ];

  const legalLinks = [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'Accessibility', href: '#' },
  ];

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100 border-t border-slate-700">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-400" />
              Leave Management
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Streamlined leave management system designed for modern organizations. 
              Efficient, transparent, and user-friendly.
            </p>
            <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-950/30 px-3 py-2 rounded-lg border border-emerald-800/30">
              <CheckCircle2 className="w-4 h-4" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-all duration-200 group cursor-pointer"
                    onMouseEnter={() => setHoveredLink(link.label)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    <link.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-sm">{link.label}</span>
                    <ChevronRight 
                      className={`w-3 h-3 transition-transform duration-200 ${
                        hoveredLink === link.label ? 'translate-x-1' : ''
                      }`} 
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Help & Support</h4>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-all duration-200 group cursor-pointer"
                    onMouseEnter={() => setHoveredLink(link.label)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    <link.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-sm">{link.label}</span>
                    <ChevronRight 
                      className={`w-3 h-3 transition-transform duration-200 ${
                        hoveredLink === link.label ? 'translate-x-1' : ''
                      }`} 
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contact Us</h4>
            <div className="space-y-3">
              <a 
                href="mailto:support@leavesystem.org" 
                className="flex items-start gap-3 text-gray-400 hover:text-blue-400 transition-colors duration-200 group"
              >
                <Mail className="w-4 h-4 mt-1 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-xs text-gray-500">Email Support</p>
                  <p className="text-sm">support@leavesystem.org</p>
                </div>
              </a>
              <a 
                href="tel:+911234567890" 
                className="flex items-start gap-3 text-gray-400 hover:text-blue-400 transition-colors duration-200 group"
              >
                <Phone className="w-4 h-4 mt-1 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-xs text-gray-500">Phone Support</p>
                  <p className="text-sm">+91 (123) 456-7890</p>
                </div>
              </a>
              <div className="flex items-start gap-3 text-gray-400">
                <Clock className="w-4 h-4 mt-1" />
                <div>
                  <p className="text-xs text-gray-500">Business Hours</p>
                  <p className="text-sm">Mon-Fri: 9:00 AM - 6:00 PM IST</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-700/50"></div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} Leave Management System. All rights reserved.
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {legalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-gray-400 hover:text-white transition-colors duration-200 hover:underline cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Developers */}
          <div className="text-xs sm:text-sm text-gray-400 text-center">
            <div className="mb-1">Developed by</div>
            <div className="flex flex-col items-center gap-1">
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=anaskhan3458027@gmail.com&su=Project%20Development%20Request&body=Hello,%0A%0AI%20would%20like%20to%20discuss%20a%20project%20development%20requirement.%0APlease%20let%20me%20know%20a%20suitable%20time%20to%20connect.%0A%0AThank%20you."
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium hover:underline"
              >
                Anas Khan
              </a>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=muskangupta0831@gmail.com&su=Project%20Development%20Request&body=Hello,%0A%0AI%20would%20like%20to%20discuss%20a%20project%20development%20requirement.%0APlease%20let%20me%20know%20a%20suitable%20time%20to%20connect.%0A%0AThank%20you."
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium hover:underline"
              >
                Muskan Gupta
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Border */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600"></div>
    </footer>
  );
}