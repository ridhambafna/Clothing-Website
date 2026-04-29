/**
 * app/page.tsx shadows app/(storefront)/page.tsx for the "/" route.
 * We re-export the storefront page content AND embed the storefront layout
 * directly so the homepage has Banner + Header + Footer without a circular dep.
 */
import StorefrontLayout from "./(storefront)/layout";
import HomePage from "./(storefront)/page";

export default function RootPage() {
  return (
    <StorefrontLayout>
      <HomePage />
    </StorefrontLayout>
  );
}
