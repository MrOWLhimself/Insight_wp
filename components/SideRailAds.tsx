import AdSlot from "./AdSlot";

// Fills the empty margins either side of the centered content column on
// wide viewports (1536px+, Tailwind's 2xl breakpoint) with sticky skyscraper
// ad slots. Hidden entirely below that width, since there's no spare margin
// to use on laptop/tablet/mobile — the content column already fills the
// viewport there.
export default function SideRailAds() {
  return (
    <>
      <div className="hidden 2xl:block fixed left-4 top-32 w-[160px] z-10">
        <AdSlot slotKey="insight_side_rail_left" size="300×600" className="h-[600px]" />
      </div>
      <div className="hidden 2xl:block fixed right-4 top-32 w-[160px] z-10">
        <AdSlot slotKey="insight_side_rail_right" size="300×600" className="h-[600px]" />
      </div>
    </>
  );
}
