interface MobileOverlayProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const MobileOverlay = ({ isOpen, closeSidebar }: MobileOverlayProps) => {
  return (
    <div
      className={`
        fixed inset-0 bg-black/50 z-30 md:hidden
        transition-all duration-300
        ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
      `}
      onClick={closeSidebar}
    />
  );
};

export default MobileOverlay;