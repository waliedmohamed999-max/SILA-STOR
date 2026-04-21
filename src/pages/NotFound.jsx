import { Link } from "react-router-dom";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";

export default function NotFound() {
  return (
    <EmptyState
      title="الصفحة غير موجودة"
      text="المسار الذي فتحته غير موجود في مساحة التجارة."
      action={<Link to="/"><Button>العودة للمتجر</Button></Link>}
    />
  );
}
