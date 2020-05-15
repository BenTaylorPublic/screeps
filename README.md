# My screeps AI
![](https://screeps.com/images/logotype-animated.svg)

## TODO
### Working on
```
Clear old creeps
    Some rooms have some creeps that aren't alive anymore
    Weird
```
### Short term
```
Convert stocker state says into emotes

Lab logic
    Labs doing orders
    Stockers unloading labs

Putting the mineral chart into README
```
### Mid term:
```
MyMemory.Settings
    Settings I can change via flags (that directly match the settings key)
    Constants are all numbers
    eg:
        set-CONSCRIPTION_RANGE-5
        set-OBSERVER_WIDTH-5

Upgrader role
    For 6.8+

Towers sitting on 50% letting containers die

Attack creeps to kill construction sites

Attack creeps need to not update target every 5 ticks
    Because when I indicate what to target, it just gets removed in 5 :(
    Possibly leave a flag to set that
    Maybe use the setting memory logic

Signing controller with flag string
    Flag limit is 60 characters
    Sign limit is 100 characters
```
### Long term:
```
Monitor force laborer spawns in linked rooms
    They should only be used to get the room out of ruts
    I'm thinking that the ruts can be observed and fixed through this monitoring

Buffing

Remote spawning for low stage rooms
    If a room under stage 6 (no terminal)
    Maybe a stage 8 room provides them creeps
    Only if the stage 8 room is within ~2-3 rooms
    Otherwise the TTL will make it pretty pointless

Make a ranged creep for dealing with other attack creeps

Attack logic should be combined
    Attacking is very similar logic, and the system I have complicates it
    They should be combined and using the memory flag constants for settings
    Example:
        When sending the charge, it should check the memory to see if its going to repeat (attack-pressure)
        
Attack Hold
    Maintain 1 creep in the room
    Spawn when they're about to die
    Only use 1 room provider, and spawn it when the TTL < 150 + (travelDistance * 50) 

Attack Large
    Very similar to AttackQuick
    Only attack when 1 of the attack creeps has < 300ish ticks to live
    Once the creep spawns, provide a time estimate of when it will begin (using tick time)
    Rooms should not make any other creeps until the attack is done (like AttackQuick)

Attack Healer Drain
    healer-drain
    Sends a bunch of healers (just HEAL + MOVE)
    They move in a tight ball
    They just get off the edge of the map and heal each other
    Will be used to empty their towers before the attack

Put in an optional attack-renew flag
    For all attacks, it'd be another state before rally
    Like another rally flag, but they wait until they're all there
    Once they're all there, they all renew and head to rally flag
    They wait again at the rally flag

Repeat attack target reticle

PowerScav
    Use ScavengeController

Power
    Power creeps control

Watch-start/stop flag
    A 2nd observer to continuously watch a room

Nukes (Offence)
    nuke-launch flag

Offload
    offload-start & offload-end
    Used when abandoning a room or being nuked
    Just pushes everything out via the terminal

Scavenger shouldn't check state every tick
    Only when they get to their target    

Downgrade controller creep
    Flag name "downgrade-{X}"
    Where X is how many CLAIM parts (matched by MOVE parts)
    It varies in claim parts because 1 would block it, but 25 would be reducing it a lot
    Maybe a repeat option, for when it dies

Bank object shouldn't be nullable
    It should be stored as a different type
    But pulled out as type MyRoom

Scrubs to wreck message
    If it's a respawn or novice area, include the time it wears off
    Give the message a cooldown of the ending time - 5 minutes so if they're low level still it'll re-email
    Api is Game.map.getRoomStatus(roomName)
        https://docs.screeps.com/api/#Game.map.getRoomStatus

Link pos and storage pos might not need to be stored
```

## Flag Names
```
ex-1 to 60
cont
tower-1 to 6
storage
link-source
link-bank
link-controller
spawn
power-spawn
observer-set-{WIDTH}
bank-linker-pos
digger-cont
lab-buffer
lab-reagent-1
lab-reagent-2

sign
sign-all
claim
scavenge-{RESOURCE_AMOUNT}

attack-quick-rally
attack-quick-room-target
attack-pressure-rally
attack-pressure-room-target
attack-prio

profile
profile-function
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

## Setup
Run `npm install` to get packages

Replace `declare const Memory: Memory;` with `declare const Memory: any;`    
Because that causes issues with my memory system

Run `npm start` to compile

Push to master to release