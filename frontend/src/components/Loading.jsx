import styles from "./Loading.module.css";
import Lottie from "lottie-react";
import loadingAnimation from "../../public/spinner.json";

const Loading = () => {
  return (
    <div className={styles.loading_container}>
      <Lottie
        animationData={loadingAnimation}
        loop={true}
        className={styles.spinner_custom}
      />
    </div>
  );
};

export default Loading;
