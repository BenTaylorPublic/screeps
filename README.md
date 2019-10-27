# My screeps AI
![](https://screeps.com/images/logotype-animated.svg)
 
## Setup
Run `npm install` to get packages

Run `npm start` to compile

Push to master to release

## TODO
### Working on
```
Attack
    Test "attack-target" red flag
    Test "attack-quick"
    Priority target's via flags
        Pressure
            Dont remove rally flag
            Keep doing current behaviour repetitively
            Rooms should maintain 1 laborer only (but keep miners, linkers, haulers)
```
### Short term
```
Attack
    Attack params/modes
        Large
            Very similar to now
            Only attack when 1 of the attack creeps has < 300ish ticks to live
            Once the creep spawns, provide a time estimate of when it will begin (using tick time)
            Rooms should not make any other creeps until the attack is done (like AttackQuick)

Writing on a room sign via a flag

Fill Miners up with more MOVE parts so they get to the source quicker
    Make it optional, so if there's not enough energy, it still spawns
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

Room stages 6 to 7
    RCL
    Tower
    10 Extensions
    3 Labs
    Link
    Spawn
    
Room stages 7 to 8
    RCL
    3 Towers
    10 Extensions
    4 Labs
    Spawn
    Observer
    Power Spawn

Power
    Gaining power levels
        Use observers to check rooms
```
### Long term:
```
Spawning
    Spawns could have a queue
    This would save the spawn logic from assembling a body every tick until it's able to be used
    Would also allow having a priority queue (Defence > Offence > Economy)

Claim creeps don't seem to come from the closest (was diagonal)
    Maybe see if the getRoomLinearDistance returns 2 for diagonal room?

Links
    Should be able to skip from stage 1.6 to 4.8 (skip caches)
    Should place links in this order
        Bank
        Link source (using a number priority, so you can force it to build one on the far away source)
        Link out

Empire Command
    During Attack Quick, empire command shouldn't halt all rooms just because 1 hasn't provided

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

5.2 ->  5.4 : Room has 3 links
5.2 <-  5.4 : Room has < 3 links

5.4 ->  5.6 : Room has >= 40 extensions
5.4 <-  5.6 : Room has < 40 extensions

5.6 ->  5.8 : Room has extractor
5.6 <-  5.8 : Room has no extractor

5.8 ->  5.9 : Room has extractor
5.8 <-  5.9 : Room has no extractor

5.9 ->  6   : Room has >= 3 labs
5.9 <-  6   : Room has < 3 labs
```
### Room controller levels in a nice format:
```
Lvl Req         Other                   Towers  Links   Spawns  Extensions  Ramparts Labs
1   200	        Roads, 5 Containers                     1
2   45,000      Walls                                           5 50 cap    300K
3   135,000                             1                       10 50 cap   1M
4   405,000     Storage                                         20 50 cap   3M
5   1,215,000	                        2       2               30 50 cap   10M
6   3,645,000	Extractor, Terminal             3               40 50 cap   30M     3
7   10,935,000	                        3       4       2       50 100 cap  100M    6
8   -	        Observer, Power Spawn   6       6       3       60 200 cap  300M    10
```
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
