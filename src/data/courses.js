export const courses = [
    {
      id: "pinevalley",
      name: "Pine Valley Golf Club",
      teeBoxes: [
        {
          id: "championship",
          name: "Championship",
          color: "Black",
          rating: 74.9,
          slope: 155
        },
        {
          id: "back",
          name: "Back",
          color: "Blue",
          rating: 73.1,
          slope: 145
        },
        {
          id: "middle",
          name: "Middle",
          color: "White",
          rating: 71.3,
          slope: 139
        }
      ],
      holes: Array(18).fill(null).map((_, index) => ({
        number: index + 1,
        par: 4, // You can customize these pars
        teeDistances: {
          championship: 425 + (index * 10), // Example distances
          back: 405 + (index * 10),
          middle: 385 + (index * 10)
        }
      }))
    },
    {
        id: "bethpage",
        name: "Bethpage Black Course",
        teeBoxes: [
          {
            id: "championship",
            name: "Championship",
            color: "Black",
            rating: 74.9,
            slope: 155
          },
          {
            id: "back",
            name: "Back",
            color: "Blue",
            rating: 73.1,
            slope: 145
          }
        ],
        holes: Array(18).fill(null).map((_, index) => ({
          number: index + 1,
          par: 4, // You can customize these pars
          teeDistances: {
            championship: 452 + (index * 10), // Example distances
            back: 395 + (index * 10),
          }
        }))
      }
  ];
  
  export const lieTypes = [
    { id: 'tee', name: 'Tee' },
    { id: 'fairway', name: 'Fairway' },
    { id: 'rough', name: 'Rough' },
    { id: 'sand', name: 'Bunker' },
    { id: 'green', name: 'Green' }
  ];
  
  export const clubTypes = [
    { id: 'driver', name: 'Driver' },
    { id: '3wood', name: '3 Wood' },
    { id: '5wood', name: '5 Wood' },
    { id: '7wood', name: '7 Wood' },
    { id: '3hybrid', name: '3 Hybrid' },
    { id: '4hybrid', name: '4 Hybrid' },
    { id: '2iron', name: '2 Iron' },
    { id: '3iron', name: '3 Iron' },
    { id: '4iron', name: '4 Iron' },
    { id: '5iron', name: '5 Iron' },
    { id: '6iron', name: '6 Iron' },
    { id: '7iron', name: '7 Iron' },
    { id: '8iron', name: '8 Iron' },
    { id: '9iron', name: '9 Iron' },
    { id: 'pw', name: 'Pitching Wedge' },
    { id: 'gw', name: 'Gap Wedge' },
    { id: 'sw', name: 'Sand Wedge' },
    { id: 'lw', name: 'Lob Wedge' },
    { id: 'putter', name: 'Putter' }
  ];
  // Shot categories for strokes gained calculations
  export const shotCategories = {
    OFF_TEE: 'Off the Tee',
    APPROACH: 'Approach',
    AROUND_GREEN: 'Around the Green',
    PUTTING: 'Putting'
  };
  
  // Helper function to determine shot category
  export const determineShotCategory = (holeNumber, shotNumber, distanceToHole, lieType, holePar) => {
    if (shotNumber === 1 && holePar >= 4) {
      return shotCategories.OFF_TEE;
    }
    if (lieType === 'green') {
      return shotCategories.PUTTING;
    }
    if (distanceToHole <= 50) {
      return shotCategories.AROUND_GREEN;
    }
    return shotCategories.APPROACH;
  };