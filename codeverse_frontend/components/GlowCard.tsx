// components/GlowCard.tsx
export default function GlowCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <div className="bg-gradient-to-br from-[#1c1c2d] to-[#2e2e48] p-5 rounded-xl shadow-glow border border-accent text-text">
        <h2 className="font-heading text-xl mb-2">{title}</h2>
        {children}
      </div>
    );
  }
  