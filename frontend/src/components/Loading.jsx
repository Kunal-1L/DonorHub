import styles from "./Loading.module.css";

const Loading = () => {
  return (
    <div className={styles.loading_container}>
      <div className={styles.spinner}>
        <span className={styles.visually_hidden}>Loading...</span>
      </div>
    </div>
  );
};

export default Loading;
