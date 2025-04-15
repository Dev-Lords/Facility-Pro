import { useEffect, useState } from "react";
import { fetchIssues } from "../../backend/services/models/allissues.js";
import IssuesPageList from "./IssuesPageList";

const IssuesPage = () => {
    const [issues, setIssues] = useState([]);
    
    useEffect(() => {
        const loadIssues = async () => {
            const data = await fetchIssues();
            setIssues(data);
        };
        loadIssues();
    }, []);

    console.log(issues);
  
    return (
      <main>
        <header className="IssuesPage-header"><h1>Issue Reports</h1></header>
        <IssuesPageList issues={issues} />
      </main>
    );
  }
  
export default IssuesPage;