import "./App.css";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { SignIn, SignUp } from "./pages/SignPages";
import AwardsEditor from "./pages/AddAndEditAwards";
import AccountPage from "./pages/AccountPage";
import { createContext, useContext, useState } from "react";
import BusinessPage from "./pages/BusinessPage";
import CustomerPage from "./pages/UserPage";
import InvoiceEditor from "./pages/InvoiceEditor";
import InvoiceClaimer from "./pages/InvoiceClaimer";
import { getCookie } from "./Cookies";

const UserContext = createContext();
function App() {
  let returningUser = null;
  if (document.cookie) {
    returningUser = {
      id: getCookie("user"),
      account_type: getCookie("acct_type"),
    };
  }
  const [user, setUser] = useState(returningUser);

  const setNewUser = (newUser) => {
    setUser(newUser);
  };

  return (
    <UserContext.Provider value={[user, setNewUser]}>
      <Router>
        <Switch>
          <Route exact path="/">
            <HomePage />
          </Route>
          <Route exact path="/signup">
            <SignUp />
          </Route>
          <Route exact path="/signin">
            <SignIn />
          </Route>
          <Route exact path="/account">
            <AccountPage />
          </Route>
          <Route path="/reward/add/">
            <AwardsEditor mode="add" />
          </Route>
          <Route path="/reward/update/:rewardid">
            <AwardsEditor mode="update" />
          </Route>
          <Route path="/business/:businessid">
            <BusinessPage />
          </Route>
          <Route path="/customer/:customerid">
            <CustomerPage />
          </Route>
          <Route path="/invoice/update/:invoiceid">
            <InvoiceEditor mode="update" />
          </Route>
          <Route path="/invoice/add/">
            <InvoiceEditor mode="add" />
          </Route>
          <Route path="/invoice/claim/:invoiceid/:customerid">
            <InvoiceClaimer />
          </Route>
        </Switch>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
export { UserContext };
