import { ClipLoader } from "react-spinners";

function LoadingComponent({ isLoading }) {
  return (
    <ClipLoader
      color="#000000"
      loading={isLoading}
      size={50}
      aria-label="Loading Spinner"
    />
  );
}

export default LoadingComponent;