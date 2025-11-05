import { checkHealth } from "@/lib/health";

const HealthCheckPage = async () => {
  const { status, error } = await checkHealth();

  return <div>HealthCheckPage: {status}</div>;
};

export default HealthCheckPage;
