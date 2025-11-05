import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ErrorAlertProps = {
  error: any;
};

const ErrorAlert = ({ error }: ErrorAlertProps) => {
  return (
    <Alert variant="destructive" className="bg-destructive/5 border-none">
      <AlertCircleIcon />
      <AlertTitle>Error!</AlertTitle>
      <AlertDescription>
        <p>
          {error?.message
            ? error.message
            : typeof error === "string"
            ? error
            : JSON.stringify(error)}
        </p>
      </AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;
