import { useScrollToTop } from '../hooks/useScrollToTop';
import upArrowIcon from "../icons/up-arrow-icon.svg";
import '../styles/ScrollToTopButton.css';

const ScrollToTopButton = () => {
  const scrollToTop = useScrollToTop();

  return (
    <button className="back-to-top-btn" onClick={scrollToTop}>
      <img src={upArrowIcon} alt="Back to Top" className="back-to-top-icon" />
    </button>
  );
};

export default ScrollToTopButton;
