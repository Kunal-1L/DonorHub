import styles from "./Loading.module.css";
import Lottie from "lottie-react";
import loadingAnimation from "../../public/spinner.json";

const Loading = () => {
  return (
    <div className={styles.loading_container}>
      <Lottie
        animationData={loadingAnimation}
        loop={true}
        style={{ width: 100, height: 100 }}
      />
    </div>
  );
};

export default Loading;
