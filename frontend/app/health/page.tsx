import { checkHealth } from "@/lib/health";

const HealthCheckPage = async () => {
  const { success: status } = await checkHealth();

  return <div>HealthCheckPage: {status}</div>;
};

export default HealthCheckPage;
