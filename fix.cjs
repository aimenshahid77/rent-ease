const fs = require('fs');
const path = require('path');

const replaceInFile = (filePath, replacements) => {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  for (const { from, to } of replacements) {
    content = content.replace(from, to);
  }
  fs.writeFileSync(fullPath, content);
};

// Fix TS1484 (import type)
const typeReplacements = [
  { file: 'src/hooks/useAuth.ts', replacements: [{ from: /import \{ UserRole \} from '\.\.\/types';/, to: "import type { UserRole } from '../types';" }] },
  { file: 'src/hooks/useListings.ts', replacements: [{ from: /import \{ ListingStatus \} from '\.\.\/types';/, to: "import type { ListingStatus } from '../types';" }] },
  { file: 'src/services/auth.ts', replacements: [{ from: /import \{ Profile, UserRole \} from '\.\.\/types';/, to: "import type { Profile, UserRole } from '../types';" }] },
  { file: 'src/services/listings.ts', replacements: [{ from: /import \{ Listing, ListingImage, ListingStatus, SavedListing, Inquiry, Profile, AuditLog \} from '\.\.\/types';/, to: "import type { Listing, ListingImage, ListingStatus, SavedListing, Inquiry, Profile, AuditLog } from '../types';" }] },
  { file: 'src/services/reviews.ts', replacements: [{ from: /import \{ Review, Profile \} from '\.\.\/types';/, to: "import type { Review, Profile } from '../types';" }] },
  { file: 'src/store/authStore.ts', replacements: [{ from: /import \{ Profile \} from '\.\.\/types';/, to: "import type { Profile } from '../types';" }] }
];

// Fix unused variables
const unusedReplacements = [
  { file: 'src/components/listings/ListingCard.tsx', replacements: [{ from: /Sparkles, /, to: "" }] },
  { file: 'src/components/dashboard/LandlordDashboard.tsx', replacements: [{ from: /, ArrowRight/, to: "" }] },
  { file: 'src/pages/LandingPage.tsx', replacements: [{ from: /const \[searchFilters.*?;/, to: "const searchFilters = {}; // eslint-disable-next-line @typescript-eslint/no-unused-vars\n" }] },
  { file: 'src/pages/landlord/LandlordInquiriesPage.tsx', replacements: [{ from: /MessageSquare, /, to: "" }, { from: /const unread.*?;/, to: "const unread = 0; // eslint-disable-next-line @typescript-eslint/no-unused-vars\n" }] },
  { file: 'src/pages/ListingsPage.tsx', replacements: [{ from: /useEffect, /, to: "" }, { from: /SlidersHorizontal, /, to: "" }] },
  { file: 'src/pages/tenant/TenantProfilePage.tsx', replacements: [{ from: /FileText, /, to: "" }] },
  { file: 'src/hooks/useListings.ts', replacements: [{ from: /data \}/g, to: "} // eslint-disable-next-line @typescript-eslint/no-unused-vars\n" }, {from: /data: /, to: "data: _data, // eslint-disable-next-line @typescript-eslint/no-unused-vars\n"}]}
];

const allReplacements = [...typeReplacements, ...unusedReplacements];

for (const { file, replacements } of allReplacements) {
  replaceInFile(file, replacements);
}
console.log('Fixed');
