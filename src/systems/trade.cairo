#[system]
mod BuySystem {
    fn execute(game_id: felt252, player_id: felt252, drug_id: usize, quantity: usize) {
        // 1. Verify the caller owns the player.
        // 2. Get current price for location for quantity.
        // 3. Ensure user can afford it.
        // 4. Perform the trade.
        // 5. Update the location's inventory.
        // 6. Update the player's inventory.

        let game = Query::<Game>::entity((game_id));
        let player = Query::<Location, Cash>::entity((game_id, player_id));
        let next_location = Query::<Location>::entity((game_id, next_location_id));

        return ();
    }
}
