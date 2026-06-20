import { FEATURES } from './FeaturesBar';

export default function FeatureList() {
  return (
    <div className="space-y-4">
      {FEATURES.map(({ Icon, title, desc }) => (
        <div key={title} className="flex items-center gap-3">
          <Icon inline />
          <div>
            <p className="text-sm font-medium text-charcoal">{title}</p>
            <p className="text-xs text-gray-500">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
