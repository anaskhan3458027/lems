// app/leave/management/components/layout/Footer.tsx
'use client';

import Image from 'next/image';
import React from 'react';

export default function Footer() {
  const partnerLogos = [
    { src: "/Images/footer/logo2.svg", alt: "Jal Shakti", link: "https://www.jalshakti-dowr.gov.in/" },
    { src: "/Images/footer/logo1.png", alt: "Denmark", link: "https://um.dk/en" },
    { src: "/Images/footer/logo3.gif", alt: "Company Seal", unoptimized: true, link: "https://nmcg.nic.in/" },
    { src: "/Images/footer/iitbhu.png", alt: "IIT BHU", link: "https://iitbhu.ac.in/" },
    { src: "/Images/footer/iitbombay.png", alt: "IIT Bombay", link: "https://www.iitb.ac.in/" },
    { src: "/Images/footer/iit_delhi_logo.png", alt: "IIT Delhi", link: "https://home.iitd.ac.in/" },
    { src: "/Images/footer/IIT_Madras_Logo.svg.png", alt: "IIT Madras", link: "https://www.iitm.ac.in/" },
    { src: "/Images/footer/japan.svg", alt: "Japan", link: "https://www.global.hokudai.ac.jp/" },
  ];

  return (
    <footer className="w-full mt-auto">
      {/* Partner Logos */}
      <div className="bg-gray-100 py-3 sm:py-5 lg:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-3">
            {partnerLogos.map((logo, index) => (
              <a
                key={index}
                href={logo.link}
                target="_blank"
                rel="noopener noreferrer"
                className="relative w-16 h-10 sm:w-20 sm:h-12 md:w-24 md:h-14 lg:w-28 lg:h-16 xl:w-32 xl:h-18 hover:opacity-80 hover:-translate-y-0.5 transition-all duration-200"
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  fill
                  sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, (max-width: 1024px) 96px, (max-width: 1280px) 112px, 128px"
                  style={{ objectFit: 'contain', padding: '4px' }}
                  unoptimized={logo.unoptimized || false}
                  className="rounded-md"
                />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="bg-[#000066] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">
                Leave Management System
              </h3>
              <p className="text-xs sm:text-sm text-white/70">
                Simple and transparent leave planning, approvals, and tracking for your organization.
              </p>
            </div>

            <div>
              <h4 className="text-sm sm:text-base font-semibold mb-2">Quick Links</h4>
              <ul className="space-y-1 text-xs sm:text-sm text-white/70">
                <li><a href="#apply-leave" className="hover:text-white hover:underline">Apply for Leave</a></li>
                <li><a href="#my-requests" className="hover:text-white hover:underline">My Leave Requests</a></li>
                <li><a href="#team-calendar" className="hover:text-white hover:underline">Team Leave Calendar</a></li>
                <li><a href="#reports" className="hover:text-white hover:underline">Reports & Analytics</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm sm:text-base font-semibold mb-2">Help & Support</h4>
              <ul className="space-y-1 text-xs sm:text-sm text-white/70">
                <li><a href="#faq" className="hover:text-white hover:underline">FAQs</a></li>
                <li><a href="#guidelines" className="hover:text-white hover:underline">Leave Policy & Guidelines</a></li>
                <li><a href="mailto:support@example.com" className="hover:text-white hover:underline">Contact Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm sm:text-base font-semibold mb-2">System Status</h4>
              <p className="text-xs sm:text-sm text-white/70 mb-2">All services operational.</p>
              <button className="inline-flex items-center px-3 py-1.5 rounded-full bg-white text-[#000066] text-xs sm:text-sm font-semibold hover:bg-slate-100 transition">
                View Change Log
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/15 py-4">
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-2">
            <p className="text-xs sm:text-sm text-white/70 font-medium text-center">
              © {new Date().getFullYear()} Leave Management System
            </p>
            <p className="text-[11px] sm:text-xs text-white/70">All Rights Reserved.</p>

            {/* Developed By */}
            <div className="mt-1 text-[11px] sm:text-xs text-white/70 text-center">
  <div>Developed by</div>

  <div className="flex flex-col items-start mt-1">
    <a
      href="https://mail.google.com/mail/?view=cm&fs=1&to=anaskhan3458027@gmail.com&su=Project%20Development%20Request&body=Hello,%0A%0AI%20would%20like%20to%20discuss%20a%20project%20development%20requirement.%0APlease%20let%20me%20know%20a%20suitable%20time%20to%20connect.%0A%0AThank%20you."
      target="_blank"
      rel="noopener noreferrer"
      className="text-white hover:underline font-medium"
    >
      Anas Khan
    </a>

    <a
      href="https://mail.google.com/mail/?view=cm&fs=1&to=muskangupta0831@gmail.com&su=Project%20Development%20Request&body=Hello,%0A%0AI%20would%20like%20to%20discuss%20a%20project%20development%20requirement.%0APlease%20let%20me%20know%20a%20suitable%20time%20to%20connect.%0A%0AThank%20you."
      target="_blank"
      rel="noopener noreferrer"
      className="text-white hover:underline font-medium"
    >
      Muskan Gupta
    </a>
  </div>
</div>


            <div className="flex gap-4 text-[11px] sm:text-xs mt-2">
              <a href="#privacy" className="text-white/70 hover:text-white">Privacy Policy</a>
              <a href="#terms" className="text-white/70 hover:text-white">Terms of Use</a>
              <a href="#accessibility" className="text-white/70 hover:text-white">Accessibility</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
