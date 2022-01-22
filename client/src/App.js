import React, {Component} from "react"
import SearchPage from './Components/SearchPage';

class App extends Component {
    render() {
        return(
            <div className='App'>
                <h1>Cocktail Raffle!</h1>
                <SearchPage/>
            </div>
        )
    }
}

export default App