# My screeps AI
![](https://screeps.com/images/logotype-animated.svg)

## TODO
### Working on
```
Bank memory should be all grouped inside one key
```
### Short term
```

6.2 = 6.25
6.4 = 6.5
Stage 6.6 -> 6.8, controller link
    Link placed beside controller for laborer creep to use
    Source links should check it before going to bank
6.8 = 6.75
```
### Mid term:
```
Spawns should NOT use an array of strings
    Needs to be done so I can restructure rooms

Stage 7.9 -> 8, labs
    Lab Memory
        MyRoom will have an id of a buffing one
            Next to bank
            BankLinker will be responsible for it
        Rest will use the person format but 1 missing
        Should be stored in MyRoom.Labs
        Array of 2 for center ones
            id
        Array of 7 for outside ones
            id
            cooldownTill
        Hopefully I can get it to assign the memory manually with 1 flag saying "lab-buffer"
```
### Long term:
```
Buffing

Upgrader role
    For 6.8+

Attack
    Large
        Very similar to AttackQuick
        Only attack when 1 of the attack creeps has < 300ish ticks to live
        Once the creep spawns, provide a time estimate of when it will begin (using tick time)
        Rooms should not make any other creeps until the attack is done (like AttackQuick)
    HealerDrain
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

Marketing logic (will be at empire level)
    Price history
    Buy/sell logic

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

MyMemory.Settings
    Settings I can change via flags (that directly match the settings key)
    Constants are all numbers
    eg:
        set-CONSCRIPTION_RANGE-5
        set-OBSERVER_WIDTH-5
```

## Flag Names
```
ex-1 to 60
cont
tower-1 to 6
storage
link-source
link-bank
spawn
power-spawn
observer-set-{WIDTH}
bank-linker-pos
digger-cont

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