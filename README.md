# My screeps AI
![](https://screeps.com/images/logotype-animated.svg)
 
## Setup
Run `npm install` to get packages

Run `npm start` to compile

Push to master to release

## TODO
### Working on
```
Room stages 7 to 8
    3 Towers        7.4
    10 Extensions   7.6
    Spawn           7.8
    Power Spawn     8
```
### Short term
```
Power
    Gaining power levels
        Use observers to check rooms
        Send 2 creeps to get it
```
### Mid term:
```
Report/Emails
    Make it say "enemy entered", "enemy died" etc 
        Remove the log that says "tower attacking X" once thats done
    This should be helpful in the longrun too once I need to have defence logic
    Needs a rework so it includes attentions, but doesn't spam like it does ingame
    Need an email controller to handle it all
    Stage "ATTENTION" should email (once!)
        If possible, a 1 day cooldown on an "ATTENTION" message

Flag helper function to get flags
    Pass it:
        an array of strings
        bool if the array can have extra on the end (eg "derp" or "derp-uniqueNumber")
        Optional room name string, if it should be a limited to a specific room
        Returns an array (and another version of it returns a Flag | null

New Role - Stocker
    Just used to stock extensions, spawns, and towers
    Always have 1 (maybe have more? idk, just 1 single for now)
    Just move and carry body
    Remove stocking logic from Laborers 
        (currently expensive I think)
        Would mean Laborers JUST upgrade
    Logic for stocking should be
        When spawning or shooting turrent
        Request energy equal to the amount spent
        The creep has a priority queue of things it needs to stock
            (towers > spawn > extensions, no aging)

Performance
    Ensure creep is spawned before it starts trying to control it
    Compile construction sites in a list (once) before calling laborer.run
    Move creep arrays into their room objects

Writing on a room sign via a flag

Optional buildings
    Links
        If you have less links than the cap, run the linkCheck logic on every stage loop
    Observer
    Nuker
    Labs
```
### Long term:
```
Attack
    Priority target's via flags
    Attack params/modes
        Large
            Very similar to now
            Only attack when 1 of the attack creeps has < 300ish ticks to live
            Once the creep spawns, provide a time estimate of when it will begin (using tick time)
            Rooms should not make any other creeps until the attack is done (like AttackQuick)

Spawning
    Spawns could have a queue
    This would save the spawn logic from assembling a body every tick until it's able to be used
    Would also allow having a priority queue (Defence > Offence > Economy)

Claim creeps don't seem to come from the closest (was diagonal)
    Maybe see if the getRoomLinearDistance returns 2 for diagonal room?

Links
    Should be able to skip from stage 1.6 to 4.8 (skip caches)
    Links should look at a number to determine what order to build
        This is because there WILL be 4 link types
            link-source
            link-bank
            link-out
            link-in

Mining minerals and directly selling them

Marketing logic (will be at empire level)
    Price history
    Buy/sell logic
    Spawning marketers (to haul to/from storage)
    Marketer role
    
Lab logic
    Spawning lab assistants (to haul to/from storage)
    LabAssistant role
    Lab logic of what to request/combine/buff
    
Spawn a new miner before the old one dies, so no downtime.
    This is minor, because a creep only dies every 50 minutes
    So, with a 1 minute walk time, it would give 2% more power
    
Hauling between rooms 
    (Energy, and minerals), when starting room is RoomStage 8 (maybe 7?)
    Might help to speed up getting all rooms to 8?

Power
    Power creeps control

Nukes (Offence)
    Flags:
        nuke-load           //On the nuker
        nuke-stop-loading   //On the nuker
        nuke-launch         //On the target

Nukes (Defence)
    Use FIND_NUKES constant and instantly email
```

## Flag Names
```
ex-1 to 60
cont
tower-1 to 6
storage
link-source
link-out
link-bank
spawn

claim
report
attack-quick-rally
attack-quick-room-target
attack-pressure-rally
attack-pressure-room-target
profile
profile-function
```

## Stage Progression
```
Loosely based on RCL
-1 is default room level

-1  ->  0   : Get a room controller that's mine
-1  <-  0   : Have no room controller that's mine

0   ->  0.5 : RCL is level >= 1
0   <-  0.5 : RCL is level < 1

0.5 ->  1   : Room has >= 1 spawn
0.5 <-  1   : Room has < 1 spawns

1   ->  1.3 : RCL is level >= 2
1   <-  1.3 : RCL is level < 2

1.3 ->  1.6 : Room has >= 5 extensions
1.3 <-  1.6 : Room has < 5 extensions

1.6 ->  2   : Room has caches length >= source amount
1.6 <-  2   : Room has caches length < source amount

2   ->  2.3 : RCL is level >= 3
2   <-  2.3 : RCL is level < 3

2.3 ->  2.6 : Room has >= 1 tower
2.3 <-  2.6 : Room has < 1 tower

2.6 ->  3   : Room has >= 10 extensions
2.6 <-  3   : Room has < 10 extensions

3   ->  3.3 : RCL is level >= 4
3   <-  3.3 : RCL is level < 4

3.3 ->  3.6 : Room has >= 20 extensions
3.3 <-  3.6 : Room has < 20 extensions

3.6 ->  4   : Room has a storage bank
3.6 <-  4   : Room does not have a storage bank

4   ->  4.2 : RCL is level >= 5
4   <-  4.2 : RCL is level < 5

4.2 ->  4.4 : Room has >= 2 tower
4.2 <-  4.4 : Room has < 2 tower

4.4 ->  4.6 : Room has >= 30 extensions
4.4 <-  4.6 : Room has < 30 extensions

4.6 ->  4.8 : Room has 2 links
4.6 <-  4.8 : Room has < 2 links

4.8 ->  5   : Room has 1 sources using links, no cache or hauler
4.8 <-  5   : Room has 0 sources using links, no cache or hauler

5   ->  5.2 : RCL is level >= 6
5   <-  5.2 : RCL is level < 6

5.2 ->  5.4 : Room has > sourceCount links
5.2 <-  5.4 : Room has <= sourceCount links

5.4 ->  5.6 : Room has >= 40 extensions
5.4 <-  5.6 : Room has < 40 extensions

5.6 ->  5.8 : Room has extractor
5.6 <-  5.8 : Room has no extractor

5.8 ->  6   : Room has terminal
5.8 <-  6   : Room has no terminal

6   ->  6.25: RCL is level >= 7
6   <-  6.25: RCL is level < 7

6.25->  6.5 : Room has >= 3 tower
6.25<-  6.5 : Room has < 3 tower

6.5 ->  6.75: Room has >= 50 extensions
6.5 <-  6.75: Room has < 50 extensions

6.75->  7   : Room has >= 2 spawns
6.75<-  7   : Room has < 2 spawns

7   ->  7.2 : RCL is level >= 8
7   <-  7.2 : RCL is level < 8
```
### Room controller levels in a nice format:

| Lvl  | Req        | Other                 | Towers | Links | Spawns | Extensions | Ramparts | Labs |
|------|------------|-----------------------|--------|-------|--------|------------|----------|------|
| 1    | 200        | Roads, 5 Containers   |        |       | 1      |            |          |      |
| 2    | 45,000     | Walls                 |        |       |        | 5 50 cap   | 300K     |      |
| 3    | 135,000    |                       | 1      |       |        | 10 50 cap  | 1M       |      |
| 4    | 405,000    | Storage               |        |       |        | 20 50 cap  | 3M       |      |
| 5    | 1,215,000  |                       | 2      | 2     |        | 30 50 cap  | 10M      |      |
| 6    | 3,645,000  | Extractor, Terminal   |        | 3     |        | 40 50 cap  | 30M      | 3    |
| 7    | 10,935,000 |                       | 3      | 4     | 2      | 50 100 cap | 100M     | 6    |
| 8    | -          | Observer, Power Spawn | 6      | 6     | 3      | 60 200 cap | 300M     | 10   |

### Body parts in a nice format:
```
MOVE	        50	
Decreases fatigue by 2 points per tick.

WORK	        100	
2 energy from source per tick
1 mineral from deposit per tick
Builds structure 5 energy per tick
Repairs structure 100 hits per tick, using 1 energy per tick
Dismantles structure 50 hits per tick, giving 0.25 energy per tick
Upgrades controller 1 energy per tick

CARRY	        50	
50 resource space

ATTACK	        80	
30 hits per tick

RANGED_ATTACK	150	
1-4-10 hits per tick, up to 3 squares away
Not sure if closer or further does more damage

HEAL	        250	
Restores 12 hits per tick
4 hits per tick at distance

CLAIM	        600	
Reserves 1 tick on unclaimed controller
Downgrades timer 300 ticks on hostile controller
Removes 1 tick on unclaimed controller

TOUGH	        10
No affect, just for hit points
```
