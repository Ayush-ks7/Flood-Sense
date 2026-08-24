import { useState } from "react";

const newsArticles = [
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA8nwmWxp1ETDYs4VvLzv4rK-4TNgTHxSSafEAIKLRlnH4eIrOx8l1DRFvl4_OKSK8jc7tkRGCjw-eNPOAAO04IjBDY9ZINSVk8W_5roAtM7car9B_R77dukeasKQ2ChWM69NlP1fXRSkVSaL_R_8oU0bVnro7Q2oEA58ho0Zd8sDiFhTM0G0iN7IkC5wbaQ7tFMtxKVT4ocvzXBU4TWMu68VBHT8l1cgMSBE6A0h0GqHd9bb4zIWTB",
    alt: "Weather Update",
    category: "Weather Trends",
    time: "Today, 09:00 AM",
    title: "Incoming Front Threatens Secondary Flood Peaks",
    description:
      "Meteorological models indicate a high probability of renewed precipitation over already saturated catchments within the next 48 hours.",
    categoryClass: "bg-[#1a365d] text-[#86a0cd]",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDjU-lXE09fxhDSS9sb27TjV9Hw4Fr6tkBJyR_HQRyFit47LyJ9kHwqsJ4kgaIvOay8CAyr7s_u9Bkjn7DZS-ohh5vXQGegjX-wHCwye1tKffBZDlsqgetPMYS8UMAUVHIk-5XtYhMLbAbFX-vM6OGFkFmbGN3Hs_oeRU13doqOtr4sDBxrjQT2-Va7ei1aTC2e1XvjHiiv51j3mHlt_etAIg5utekWjI4akIyeeFhDNpuGWfAqMJnY",
    alt: "Community Impact",
    category: "Community Stories",
    time: "Yesterday",
    title: "Local Volunteers help in stabalising the situation",
    description:
      "Community-led initiatives successfully bolstered critical flood defenses ahead of the weekend surge, demonstrating localized resilience.",
    categoryClass: "bg-[#7db6ff] text-[#00477f]",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDsx5rCu1IgA-PKuqc9jMuBC-IV-HnvIwqafVMH1zlbp3Q0XxrJ4kpOuZHRNybhdm2QmxYOfBuD7EQeSXuV63m-N3xIjuOWOcX0u0yvDasvsmW6wVVEWbaQhgD3xUwYmWen-H-KiP6XYR5RXUjf7EJZwEjXIu4S8iNbQXusYpAV7Lw7sU_N62OmtsULfLo7TdjUfUfou5eu4GOXW9D6IRqNxaPMaEW1QUs5zxurlShvHvv7r_HUopBX",
    alt: "Geological sensor",
    category: "Highland Zones",
    time: "Today, 06:30 AM",
    title: "Increased Landslide Risk in Sector 4 Slopes",
    description:
      "Saturated soil conditions in the Highland Zones have triggered a level 3 alert for potential slope instability. Residents are advised to monitor for ground movement.",
    categoryClass: "bg-[#1a365d] text-[#86a0cd]",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCseoxO6-dF0T_Ga5cUTzwf5MGl9atK1YyWsn9ldVnmKbnTtjgvy8hdLeF2TBxhy7T9Lw6hj_8dP_2iy4TjbO7atijiWK5gFZhFkwRTOFDKRkHmStBdkm-BCI1qg2zwHxHjFRpphoZqNIVJ0H_EQZnMBM5_M8iiWfXis_JPf6U27TgNOPtaidcSj3KDHyaDW4_1BuKTK3qbAkzJcEbnIXL5vyDYh6pUJ_yUGTjzzl1hADB0gmlVQBvg",
    alt: "Bridge reinforcement",
    category: "Infrastructure",
    time: "Yesterday",
    title: "Bridge Reinforcement Completed in North District",
    description:
      "Engineers have successfully reinforced the primary access bridge to the Hilly Areas, ensuring supply lines remain open during the peak flood season.",
    categoryClass: "bg-[#7db6ff] text-[#00477f]",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuByPTk7v91r975B1rKxUkwNKb5trG0TlNM5ml4ZZTBGwKb8sN-3Djrd-_HhNbA9yb3MQhvAHNmlQQjttwElh034tSNqmriq5Q-PMvPYcbJ6_uvlcGf-m8-JDS74E7qzBiLKp421DdrnTlupbnVPrfApCXpJsay-IE6iSXJm-XnjDaSKvoBNIw3_zlFSjthk6RAQtlTksRGM7_UlaaH2t1K2FIaC9IeO_zOnSGgqJ0gH2cIrCz4-H3U4",
    alt: "Emergency response team",
    category: "Emergency Response",
    time: "Today, 11:45 AM",
    title: "Emergency Response Teams Clearing Highland Access Routes",
    description:
      "Specialized crews are working around the clock to clear debris from critical transit corridors following recent slope failures.",
    categoryClass: "bg-[#1a365d] text-[#86a0cd]",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDzzEJ1ssnrQvytiF-flnshSmNO-R20AZZXGxhkuhKYKj0rvFEz4p3RlA3O14SQvmj4k1BqgS6ZLQpJvsCcXgwXwp-mvA2fjD9_I6E9TXzZLCgoNctLzuXr_UfQXbJYnakMw4VeXxTlHDkVMUQTdnUW-T7A1cYu79pZ8jtI5axcc1ACnsM7CXNnshk5DhqtgKPO7Qcr6abMEbaQL8Lvjto-zEHT7C2eAp9aJyEvXq2VWMAmVqPt4zVs",
    alt: "Mobile Command Unit",
    category: "Technology",
    time: "Today, 14:20 PM",
    title: "Mobile Command Units Deployed to Remote Highland Sectors",
    description:
      "New satellite-linked command vehicles have been stationed in the Highland Zones to provide real-time data relay and coordinate local response teams in areas with limited connectivity.",
    categoryClass: "bg-[#1a365d] text-[#86a0cd]",
  },
];

const trending = [
  {
    category: "Policy Updates",
    title: "Revised Evacuation Protocols Issued for Zone B",
  },
  {
    category: "Tech Innovation",
    title: "Deployment of Autonomous Sensor Networks Expanded",
  },
  {
    category: "Weather Trends",
    title: "Long-Range Forecast: Stability Expected Mid-Week",
  },
];

function NewsCard({ article }) {
  return (
    <article className="flex cursor-pointer flex-col overflow-hidden rounded-xl border border-[#e3e2e6] bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="h-48 w-full bg-[#e3e2e6]">
        <img
          src={article.image}
          alt={article.alt}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-grow flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <span
            className={`rounded px-2 py-0.5 text-xs font-semibold ${article.categoryClass}`}
          >
            {article.category}
          </span>

          <span className="text-xs text-[#43474e]">
            {article.time}
          </span>
        </div>

        <h3 className="text-lg font-semibold leading-tight text-[#1a1c1e]">
          {article.title}
        </h3>

        <p className="line-clamp-3 text-base leading-6 text-[#43474e]">
          {article.description}
        </p>
      </div>
    </article>
  );
}

const NewzPage = () => {
  const [email, setEmail] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (email) {
      alert(`Subscribed with ${email}`);
      setEmail("");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#faf9fd] font-['Public_Sans',sans-serif] text-[#1a1c1e]">

      {/* MAIN */}
      <main className="mx-auto grid w-full max-w-[1440px] flex-grow grid-cols-1 gap-8 px-4 py-8 md:px-8 lg:grid-cols-12">

        {/* LEFT */}
        <div className="flex flex-col gap-8 lg:col-span-8">

          {/* HERO */}
          <article className="overflow-hidden rounded-xl border border-[#e3e2e6] bg-white shadow-sm">

            <div className="relative flex min-h-[400px] flex-col justify-center gap-6 overflow-hidden bg-[#002045] p-8 text-white md:p-12">

              <div className="absolute left-6 top-6 z-10 flex items-center gap-1 rounded-full bg-[#ba1a1a] px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                <span className="material-symbols-outlined animate-pulse text-base">
                  campaign
                </span>
                Breaking News
              </div>

              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

              <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-[#f2bc82]/10 blur-2xl" />

              <div className="relative z-10 flex flex-col gap-4">

                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/60">
                  <span>Displacement Report</span>
                  <span>•</span>
                  <span>Updated 2 hours ago</span>
                </div>

                <h1 className="max-w-3xl text-3xl font-semibold leading-tight md:text-[40px]">
                  Critical Displacement Data: Over 5,000 Residents Relocated
                  in Flooded Regions
                </h1>

                <div className="mt-2 flex flex-col gap-2 border-l-2 border-[#f2bc82] pl-4">

                  <p className="text-lg leading-7 text-white/90">
                    Flood-Affected Regions: North District and Sector 4
                    (Highland Zones)
                  </p>

                  <p className="text-base leading-6 text-white/70">
                    Emergency response teams have completed the primary phase
                    of relocation efforts. Infrastructure assessments are
                    prioritizing high-density residential zones in the
                    affected sectors.
                  </p>

                </div>

                <a
                  href="#"
                  className="mt-4 flex w-fit items-center gap-1 text-sm font-medium text-[#f2bc82] transition-colors hover:text-[#ffddba]"
                >
                  Read Full Displacement Report

                  <span className="material-symbols-outlined text-base">
                    arrow_forward
                  </span>
                </a>

              </div>
            </div>
          </article>

          {/* LATEST UPDATES */}
          <h2 className="mt-4 border-b border-[#c4c6cf] pb-2 text-2xl font-semibold">
            Latest Updates
          </h2>

          {/* NEWS CARDS */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {newsArticles.map((article) => (
              <NewsCard
                key={article.title}
                article={article}
              />
            ))}
          </div>

        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="flex flex-col gap-8 lg:col-span-4">

          {/* TRENDING */}
          <section className="rounded-xl border border-[#e3e2e6] bg-white p-6 shadow-sm">

            <h3 className="mb-6 flex items-center gap-2 text-2xl font-semibold">
              <span className="material-symbols-outlined text-[#002045]">
                trending_up
              </span>

              Trending Now
            </h3>

            <ul className="flex flex-col gap-5">

              {trending.map((item, index) => (
                <li
                  key={item.title}
                  className={`group flex cursor-pointer gap-4 ${
                    index > 0
                      ? "border-t border-[#c4c6cf] pt-5"
                      : ""
                  }`}
                >

                  <span className="text-3xl font-semibold leading-none text-[#e3e2e6] transition-colors group-hover:text-[#002045]">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="flex flex-col gap-1">

                    <span className="text-xs text-[#43474e]">
                      {item.category}
                    </span>

                    <p className="text-base leading-6 transition-colors group-hover:text-[#002045]">
                      {item.title}
                    </p>

                  </div>
                </li>
              ))}

            </ul>
          </section>

          {/* NEWSLETTER */}
          <section className="relative overflow-hidden rounded-xl bg-[#002045] p-6 text-white shadow-sm">

            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

            <div className="pointer-events-none absolute -bottom-5 -left-5 h-24 w-24 rounded-full bg-[#f2bc82]/20 blur-xl" />

            <div className="relative z-10 flex flex-col gap-4">

              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                <span className="material-symbols-outlined text-2xl">
                  mail
                </span>
              </div>

              <h3 className="text-2xl font-semibold">
                Stay Informed
              </h3>

              <p className="text-base leading-6 text-white/80">
                Subscribe to receive daily briefings and critical alerts
                directly to your inbox.
              </p>

              <form
                onSubmit={handleSubmit}
                className="mt-2 flex flex-col gap-3"
              >

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full rounded-lg bg-[#faf9fd] px-4 py-3 text-base text-[#1a1c1e] outline-none placeholder:text-[#74777f] focus:ring-2 focus:ring-[#1960a3]"
                />

                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#f2bc82] px-4 py-3 text-sm font-medium text-[#2b1700] transition-colors hover:bg-[#ffddba]"
                >
                  Click for updates
                </button>

              </form>

              <p className="mt-2 text-center text-xs text-white/60">
                We respect your privacy. Unsubscribe at any time.
              </p>

            </div>
          </section>

        </aside>
      </main>

      {/* FOOTER */}
      <footer className="mt-auto flex w-full flex-col items-center justify-between gap-4 bg-[#002045] px-4 py-8 text-white md:flex-row md:px-8">

        <div className="text-2xl font-bold">
          FloodGuard
        </div>

        <div className="text-center text-sm text-white/80 md:text-left">
          © 2024 FloodGuard. All rights reserved. Professional GIS
          Environmental Monitoring.
        </div>

        <div className="flex flex-wrap justify-center gap-6">

          <a
            href="#"
            className="text-sm text-white/80 transition-colors hover:text-[#f2bc82]"
          >
            Privacy Policy
          </a>

          <a
            href="#"
            className="text-sm text-white/80 transition-colors hover:text-[#f2bc82]"
          >
            Terms of Service
          </a>

          <a
            href="#"
            className="text-sm text-white/80 transition-colors hover:text-[#f2bc82]"
          >
            API Documentation
          </a>

          <a
            href="#"
            className="text-sm text-white/80 transition-colors hover:text-[#f2bc82]"
          >
            Contact Support
          </a>

        </div>
      </footer>

    </div>
  );
}

export default NewzPage
