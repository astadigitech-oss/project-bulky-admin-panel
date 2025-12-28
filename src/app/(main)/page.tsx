import { redirect } from "next/navigation";

const HomePage = () => {
  // if (!auth) {
  //   redirect("/login");
  // } else {
  redirect("/dashboard");
  // }
};

export default HomePage;
