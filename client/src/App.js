import "./App.css";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { SignIn, SignUp } from "./pages/SignPages";
import AwardsEditor from "./pages/AddAndEditAwards";

function App() {
  return (
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
        <Route path="/reward/add/">
          <AwardsEditor mode="add" />
        </Route>
        <Route path="/reward/update/:rewardid">
          <AwardsEditor mode="update" />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
