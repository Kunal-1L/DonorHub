import styles from "./Error.module.css";
import Lottie from "lottie-react";
import errorAnimation from "../../public/error404.json";

const Loading = () => {
  return (
    <div className={styles.error_container}>
      <Lottie
        animationData={errorAnimation}
        loop={true}
        style={{ width: 500, height: 500 }}
      />
    </div>
  );
};

export default Loading;
