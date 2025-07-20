import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, doc, setDoc, deleteDoc, getDocs, writeBatch, updateDoc } from 'firebase/firestore';
import { ArrowRight, ArrowLeft, Users, Utensils, Drumstick, Fish, Carrot, Salad, Check, PartyPopper, Loader2, RefreshCw, GlassWater, Tent, Sparkles, Gamepad2, Film, Flame, Armchair, Package, Pizza, Cake, IceCream, Trash2, X, PlusCircle, Home, Pencil, ShieldCheck } from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-reunion-planner-v3';

// --- Initial Data for Seeding ---
const INITIAL_DATA = {
    GROUPS: [
        { id: 'Group A', name: 'Group A', stayingAt: 'TBD' }, { id: 'Group B', name: 'Group B', stayingAt: 'TBD' },
        { id: 'Group C', name: 'Group C', stayingAt: 'TBD' }, { id: 'Group D', name: 'Group D', stayingAt: 'TBD' },
        { id: 'Group E', name: 'Group E', stayingAt: 'TBD' }, { id: 'Group F', name: 'Group F', stayingAt: 'TBD' },
        { id: 'Group G', name: 'Group G', stayingAt: 'TBD' }, { id: 'Group H', name: 'Group H', stayingAt: 'TBD' },
        { id: 'Group I', name: 'Group I', stayingAt: 'TBD' }, { id: 'Group K', name: 'Group K', stayingAt: 'TBD' },
        { id: 'Group L', name: 'Group L', stayingAt: 'TBD' }, { id: 'Group M', name: 'Group M', stayingAt: 'TBD' },
        { id: 'Group N', name: 'Group N', stayingAt: 'TBD' }, { id: 'Group O', name: 'Group O', stayingAt: 'TBD' },
        { id: 'Group P', name: 'Group P', stayingAt: 'TBD' }, { id: 'Group Q', name: 'Group Q', stayingAt: 'TBD' },
    ],
    ATTENDEES: [
        { name: 'Tom', group: 'Group A', isAdmin: false }, { name: 'June', group: 'Group A', isAdmin: true },
        { name: 'Theresa', group: 'Group B', isAdmin: true }, { name: 'Gerik', group: 'Group B', isAdmin: false }, { name: 'Gideon', group: 'Group B', isAdmin: false },
        { name: 'Colleen', group: 'Group C', isAdmin: true }, { name: 'Clarence', group: 'Group C', isAdmin: false },
        { name: 'Michele', group: 'Group D', isAdmin: true }, { name: 'Mark', group: 'Group D', isAdmin: false },
        { name: 'Katie', group: 'Group E', isAdmin: true }, { name: 'Josh', group: 'Group E', isAdmin: false }, { name: 'Wallace', group: 'Group E', isAdmin: false },
        { name: 'Kim', group: 'Group F', isAdmin: true }, { name: 'Nelson', group: 'Group F', isAdmin: false },
        { name: 'Evie', group: 'Group G', isAdmin: false }, { name: 'Lyndsey', group: 'Group G', isAdmin: true }, { name: 'Ryan', group: 'Group G', isAdmin: false }, { name: 'Lily', group: 'Group G', isAdmin: false }, { name: 'Luke', group: 'Group G', isAdmin: false }, { name: 'Lawson', group: 'Group G', isAdmin: false }, { name: 'Derek', group: 'Group G', isAdmin: false },
        { name: 'Ann', group: 'Group H', isAdmin: true }, { name: 'Richard', group: 'Group H', isAdmin: false },
        { name: 'Nicole', group: 'Group I', isAdmin: true }, { name: 'Nick', group: 'Group I', isAdmin: false }, { name: 'Thomas', group: 'Group I', isAdmin: false }, { name: 'Henrik', group: 'Group I', isAdmin: false },
        { name: 'Chris', group: 'Group K', isAdmin: false }, { name: 'Sarah', group: 'Group K', isAdmin: true }, { name: 'Chloe', group: 'Group K', isAdmin: false }, { name: 'Abby', group: 'Group K', isAdmin: false },
        { name: 'Jack', group: 'Group L', isAdmin: false }, { name: 'Tracy', group: 'Group L', isAdmin: true },
        { name: 'Amanda', group: 'Group M', isAdmin: true }, { name: 'Geoff', group: 'Group M', isAdmin: false },
        { name: 'Laura', group: 'Group N', isAdmin: true }, { name: 'Andy', group: 'Group N', isAdmin: false }, { name: 'Bev', group: 'Group N', isAdmin: false }, { name: 'Jasper', group: 'Group N', isAdmin: false }, { name: 'Micah', group: 'Group N', isAdmin: false },
        { name: 'Raelyn', group: 'Group O', isAdmin: true }, { name: 'Steve', group: 'Group O', isAdmin: false },
        { name: 'Mitch', group: 'Group P', isAdmin: false }, { name: 'Michelle', group: 'Group P', isAdmin: true }, { name: 'Olivia', group: 'Group P', isAdmin: false }, { name: 'Ava', group: 'Group P', isAdmin: false },
        { name: 'Max', group: 'Group Q', isAdmin: false }, { name: 'Haley', group: 'Group Q', isAdmin: true }, { name: 'Charlotte', group: 'Group Q', isAdmin: false }, { name: 'Hazel', group: 'Group Q', isAdmin: false },
    ],
    EQUIPMENT: [
        { id: 'largeCooler', name: 'Large Cooler', icon: <Package className="w-5 h-5 mr-2" /> },
        { id: 'foldingChairs', name: 'Folding Chairs (4+)', icon: <Armchair className="w-5 h-5 mr-2" /> },
        { id: 'portableGrill', name: 'Portable Grill', icon: <Flame className="w-5 h-5 mr-2" /> },
        { id: 'volleyballSet', name: 'Volleyball Set', icon: <Gamepad2 className="w-5 h-5 mr-2" /> },
    ],
    DRINKS: [
        { id: 'water', name: 'Water' }, { id: 'honestJuice', name: 'Honest Juice' }, { id: 'iceTea', name: 'Ice Tea' },
        { id: 'cocaColaClassic', name: 'Coca-Cola Classic' }, { id: 'dietCocaCola', name: 'Diet Coca-Cola' }, { id: 'pepsi', name: 'Pepsi' },
        { id: 'dietPepsi', name: 'Diet Pepsi' }, { id: 'dietDrPepper', name: 'Diet Dr. Pepper' }, { id: 'sprite', name: 'Sprite' },
        { id: 'spindrift', name: 'Spindrift' }, { id: 'lemonade', name: 'Lemonade' },
    ],
    MEALS: [
        { id: 'thursdayCarnivalDinner', name: 'Thursday 7/24 - Carnival Night Dinner' }, { id: 'fridayHawaiianDinner', name: 'Friday 7/25 - Hawaiian Night' },
        { id: 'saturdayBavarian', name: 'Saturday 7/26 - Bavarian Night' }, { id: 'sundayMexican', name: 'Sunday 7/27 - Mexican Night' },
    ],
    FOOD_OPTIONS: {
        thursdayCarnivalDinner: {
            main: [{ id: 'costcoCheesePizza', name: 'Costco Cheese Pizza' }, { id: 'costcoPepperoniPizza', name: 'Costco Pepperoni Pizza' }, { id: 'cauliflowerPizza', name: 'Cauliflower Crust Pizza' }],
            side: [{ id: 'gardenSalad', name: 'Garden Salad' }, { id: 'ranchDressing', name: 'Ranch Dressing' }, { id: 'italianDressing', name: 'Italian Dressing' }, { id: 'thousandIslandDressing', name: '1000 Island Dressing' }],
            snack: [{ id: 'pretzelsHummus', name: 'Pretzels & Hummus' }, { id: 'carrotSticks', name: 'Carrot Sticks' }, { id: 'popcorn', name: 'Popcorn' }, { id: 'fruitTray', name: 'Fruit Tray' }],
            dessert: [{ id: 'rootBeerFloats', name: 'Root Beer Floats' }, { id: 'costcoCake', name: 'Costco Cake' }]
        },
        fridayHawaiianDinner: {
            main: [{ id: 'instantPotChicken', name: 'Instant Pot Chicken' }, { id: 'instantPotPork', name: 'Instant Pot Pork' }],
            side: [{ id: 'hawaiianRolls', name: 'Hawaiian Rolls' }, { id: 'bbqSauce', name: 'BBQ Sauce' }, { id: 'coleslaw', name: 'Coleslaw' }, { id: 'bakedBeans', name: 'Baked Beans' }, { id: 'potatoSalad', name: 'Potato Salad' }],
            snack: [{ id: 'pineapples', name: 'Pineapples' }],
            dessert: [{ id: 'moonCake', name: 'Moon Cake' }]
        },
        saturdayBavarian: {
            main: [{ id: 'hotDogs', name: 'Hot Dogs' }, { id: 'kirklandBrats', name: 'Kirkland Brats' }, { id: 'polishDogs', name: 'Polish Dogs' }],
            side: [{ id: 'stadiumBuns', name: 'Stadium Buns' }, { id: 'glutenFreeBuns', name: 'Gluten Free Buns' }, { id: 'ketchup', name: 'Ketchup' }, { id: 'mustard', name: 'Mustard' }, { id: 'dijonMustard', name: 'Dijon Mustard' }, { id: 'relish', name: 'Relish' }, { id: 'mayo', name: 'Mayo' }, { id: 'sauerkraut', name: 'Sauerkraut' }, { id: 'macAndCheese', name: 'Macaroni and Cheese' }, { id: 'potatoSaladBavarian', name: 'Potato Salad' }],
            snack: [{ id: 'veggieTray', name: 'Veggie Tray' }, { id: 'ranchDippingSauce', name: 'Ranch Dipping Sauce' }, { id: 'fruitTrayBavarian', name: 'Fruit Tray' }],
            dessert: [{ id: 'kuchenCake', name: 'Kuchen Cake' }]
        },
        sundayMexican: {
            main: [{ id: 'instantPotBeef', name: 'Instant Pot Beef' }, { id: 'instantPotChickenMexican', name: 'Instant Pot Chicken' }],
            side: [{ id: 'blackBeans', name: 'Black Beans' }, { id: 'mexicanRice', name: 'Mexican Rice' }, { id: 'lettuce', name: 'Lettuce' }, { id: 'cilantro', name: 'Cilantro' }, { id: 'radish', name: 'Radish' }, { id: 'dicedTomato', name: 'Diced Tomato' }, { id: 'dicedOnion', name: 'Diced Onion' }, { id: 'limes', name: 'Limes' }, { id: 'cheddarCheese', name: 'Cheddar Cheese' }, { id: 'salsa', name: 'Salsa' }, { id: 'guacamole', name: 'Guacamole' }, { id: 'sourCream', name: 'Sour Cream' }, { id: 'cornTortillas', name: 'Corn Tortillas' }, { id: 'flourTortillas', name: 'Flour Tortillas' }],
            snack: [{ id: 'chips', name: 'Chips' }, { id: 'nachoCheese', name: 'Nacho Cheese' }, { id: 'sevenLayerDip', name: '7 Layer Mexican Dip' }],
            dessert: [{ id: 'churros', name: 'Churros' }, { id: 'eclaireCake', name: 'Eclaire Cake' }]
        },
    }
};

const LucideIcon = ({ name, ...props }) => {
    const icons = { Sparkles, Gamepad2, Film, Tent };
    const Icon = icons[name];
    return Icon ? <Icon {...props} /> : <Tent {...props} />;
};

const getIcon = (type, id) => {
    const icons = {
        main: { steak: <Drumstick/>, salmon: <Fish/>, pasta: <Carrot/>, burger: <Drumstick/>, hotdog: <Drumstick/>, veggieSkewer: <Salad/>, pancakes: <Utensils/>, eggsBenedict: <Utensils/>, quiche: <Utensils/>, costcoCheesePizza: <Pizza/>, costcoPepperoniPizza: <Pizza/>, cauliflowerPizza: <Pizza/>, instantPotChicken: <Drumstick />, instantPotPork: <Drumstick />, hotDogs: <Drumstick />, kirklandBrats: <Drumstick />, polishDogs: <Drumstick />, instantPotBeef: <Drumstick />, instantPotChickenMexican: <Drumstick /> },
        side: { potatoes: <Salad/>, asparagus: <Carrot/>, corn: <Salad/>, coleslaw: <Salad/>, potatoSalad: <Salad/>, bacon: <Drumstick/>, sausage: <Drumstick/>, fruitSalad: <Salad/>, gardenSalad: <Salad/>, ranchDressing: <Salad/>, italianDressing: <Salad/>, thousandIslandDressing: <Salad/>, hawaiianRolls: <Utensils />, bbqSauce: <Utensils />, bakedBeans: <Utensils />, stadiumBuns: <Utensils />, glutenFreeBuns: <Utensils />, ketchup: <Utensils />, mustard: <Utensils />, dijonMustard: <Utensils />, relish: <Utensils />, mayo: <Utensils />, sauerkraut: <Utensils />, macAndCheese: <Utensils />, potatoSaladBavarian: <Salad />, blackBeans: <Carrot/>, mexicanRice: <Utensils/>, lettuce: <Salad/>, cilantro: <Salad/>, radish: <Salad/>, dicedTomato: <Salad/>, dicedOnion: <Salad/>, limes: <Salad/>, cheddarCheese: <Utensils/>, salsa: <Utensils/>, guacamole: <Salad/>, sourCream: <Utensils/>, cornTortillas: <Utensils/>, flourTortillas: <Utensils/> },
        dessert: { cheesecake: <Utensils/>, fruitTart: <Utensils/>, muffins: <Utensils/>, cinnamonRolls: <Utensils/>, rootBeerFloats: <IceCream />, costcoCake: <Cake />, moonCake: <Cake />, kuchenCake: <Cake />, churros: <Cake />, eclaireCake: <Cake /> },
        snack: { chips: <Utensils/>, veggiePlatter: <Salad/>, pretzelsHummus: <Utensils />, carrotSticks: <Carrot />, popcorn: <Utensils />, fruitTray: <Salad />, pineapples: <Salad />, veggieTray: <Salad />, ranchDippingSauce: <Salad />, fruitTrayBavarian: <Salad />, nachoCheese: <Utensils />, sevenLayerDip: <Utensils /> }
    };
    return <div className="w-5 h-5 mr-2 text-gray-600">{icons[type]?.[id] || <Utensils/>}</div>;
};


// --- Main App Component ---
export default function App() {
    // --- State Management ---
    const [step, setStep] = useState(0); // 0 is the new login step
    const [view, setView] = useState('dashboard'); // 'dashboard', 'form'
    const [dashboardTab, setDashboardTab] = useState('attendees'); // 'attendees', 'food'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditingEvents, setIsEditingEvents] = useState(false);

    // Firebase state
    const [auth, setAuth] = useState(null);
    const [db, setDb] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    // Logged in user state
    const [currentUser, setCurrentUser] = useState(null);
    const [currentGroup, setCurrentGroup] = useState(null);
    const [currentGroupMembers, setCurrentGroupMembers] = useState([]);
    
    // Form data state
    const [healthData, setHealthData] = useState({});
    const [attendingEvents, setAttendingEvents] = useState([]);
    const [attendingMeals, setAttendingMeals] = useState([]);
    const [foodChoices, setFoodChoices] = useState({});
    const [drinkChoices, setDrinkChoices] = useState([]);
    const [equipmentBringing, setEquipmentBringing] = useState([]);

    // Dynamic data from DB
    const [events, setEvents] = useState([]);
    const [allSubmissions, setAllSubmissions] = useState([]);
    const [allAttendees, setAllAttendees] = useState([]);
    const [allGroups, setAllGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // --- Firebase Initialization and Auth ---
    useEffect(() => {
        if (firebaseConfig && Object.keys(firebaseConfig).length > 0) {
            const app = initializeApp(firebaseConfig);
            const authInstance = getAuth(app);
            const dbInstance = getFirestore(app);
            setAuth(authInstance);
            setDb(dbInstance);

            const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
                if (user) {
                    setIsAuthReady(true);
                } else {
                    try {
                        const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
                        if (token) {
                            await signInWithCustomToken(authInstance, token);
                        } else {
                            await signInAnonymously(authInstance);
                        }
                    } catch (error) {
                        console.error("Authentication failed:", error);
                    }
                }
            });
            return () => unsubscribe();
        }
    }, []);

    // --- Data Seeding & Fetching ---
    useEffect(() => {
        if (!isAuthReady || !db) return;

        const setupListeners = () => {
             const unsubscribers = [
                onSnapshot(collection(db, `/artifacts/${appId}/public/data/households`), snap => setAllSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() })))),
                onSnapshot(collection(db, `/artifacts/${appId}/public/data/events`), snap => setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })))),
                onSnapshot(collection(db, `/artifacts/${appId}/public/data/attendees`), snap => setAllAttendees(snap.docs.map(d => ({ id: d.id, ...d.data() })))),
                onSnapshot(collection(db, `/artifacts/${appId}/public/data/groups`), snap => setAllGroups(snap.docs.map(d => ({ id: d.id, ...d.data() })))),
            ];
            setIsLoading(false);
            return () => unsubscribers.forEach(unsub => unsub());
        };

        const seedDataAndListen = async () => {
            console.log("Checking if data needs to be seeded...");
            const attendeesRef = collection(db, `/artifacts/${appId}/public/data/attendees`);
            const attendeesSnap = await getDocs(attendeesRef);
            if (attendeesSnap.empty) {
                console.log("Seeding initial attendee and group data...");
                const batch = writeBatch(db);
                
                INITIAL_DATA.GROUPS.forEach(group => {
                    const groupRef = doc(db, `/artifacts/${appId}/public/data/groups`, group.id);
                    batch.set(groupRef, group);
                });
                
                INITIAL_DATA.ATTENDEES.forEach(attendee => {
                    const attendeeRef = doc(collection(db, `/artifacts/${appId}/public/data/attendees`));
                    batch.set(attendeeRef, attendee);
                });

                await batch.commit();
                console.log("Seeding complete.");
            }
            setupListeners();
        };

        seedDataAndListen();

    }, [isAuthReady, db]);
    
    // --- Computed Values ---
    const attendingMealDetails = useMemo(() => INITIAL_DATA.MEALS.filter(meal => attendingMeals.includes(meal.id)), [attendingMeals]);
    const totalSteps = 6 + attendingMealDetails.length; // Health, Events, Meals, (Dynamic Meal Steps), Drinks, Equipment, Review

    // --- Event Handlers ---
    const handleLogin = (attendee) => {
        setCurrentUser(attendee);
        const group = allGroups.find(g => g.id === attendee.group);
        setCurrentGroup(group);
        const members = allAttendees.filter(a => a.group === attendee.group);
        setCurrentGroupMembers(members);

        // Pre-fill form with existing data if available
        const submission = allSubmissions.find(s => s.groupId === group.id);
        if (submission) {
            setHealthData(submission.healthData || {});
            setAttendingEvents(submission.attendingEvents || []);
            setAttendingMeals(submission.attendingMeals || []);
            setFoodChoices(submission.foodChoices || {});
            setDrinkChoices(submission.drinkChoices || []);
            setEquipmentBringing(submission.equipmentBringing || []);
        } else {
            // Reset form for new submission
            setHealthData({});
            setAttendingEvents([]);
            setAttendingMeals([]);
            setFoodChoices({});
            setDrinkChoices([]);
            setEquipmentBringing([]);
        }

        setStep(1);
        setView('form');
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setCurrentGroup(null);
        setCurrentGroupMembers([]);
        setStep(0);
        setView('dashboard');
    };
    
    const handleNextStep = () => setStep(prev => prev + 1);
    const handlePrevStep = () => setStep(prev => prev - 1);
    
    const handleToggle = (stateSetter, value) => {
        stateSetter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
    };

    const handleHealthDataChange = (memberId, field, value) => {
        setHealthData(prev => ({
            ...prev,
            [memberId]: {
                ...(prev[memberId] || {}),
                [field]: value
            }
        }));
    };
    
    const handleFoodChoiceChange = (mealId, memberId, category, choiceId, isMultiSelect = false) => {
        setFoodChoices(prev => {
            const newChoices = { ...prev };
            if (!newChoices[mealId]) newChoices[mealId] = {};
            if (!newChoices[mealId][memberId]) newChoices[mealId][memberId] = {};
            
            if (isMultiSelect) {
                const currentCategoryChoices = newChoices[mealId][memberId][category] || [];
                if (currentCategoryChoices.includes(choiceId)) {
                    newChoices[mealId][memberId][category] = currentCategoryChoices.filter(id => id !== choiceId);
                } else {
                    newChoices[mealId][memberId][category] = [...currentCategoryChoices, choiceId];
                }
            } else {
                newChoices[mealId][memberId][category] = choiceId;
            }
            return newChoices;
        });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        
        const submissionData = {
            groupId: currentGroup.id,
            groupName: currentGroup.name,
            members: currentGroupMembers.map(m => m.name),
            healthData,
            attendingEvents,
            attendingMeals,
            foodChoices,
            drinkChoices,
            equipmentBringing,
            submittedBy: currentUser.name,
            createdAt: new Date().toISOString(),
        };

        try {
            const submissionDocRef = doc(db, `/artifacts/${appId}/public/data/households`, currentGroup.id);
            await setDoc(submissionDocRef, submissionData, { merge: true });
            
            setView('dashboard');
            setStep(0);
        } catch (error) {
            console.error("Error saving submission: ", error);
            alert("There was an error saving your submission. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // --- UI Components ---
    const StepLogin = () => {
        const [selectedGroup, setSelectedGroup] = useState(null);

        return (
            <div className="w-full max-w-2xl mx-auto text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to the Reunion Planner!</h1>
                <p className="text-lg text-gray-600 mb-8">Please find your group and name to continue.</p>
                
                {!selectedGroup ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {allGroups.map(group => (
                            <button key={group.id} onClick={() => setSelectedGroup(group)} className="p-6 bg-sky-100 text-sky-800 font-bold rounded-lg hover:bg-sky-200 transition-colors">
                                {group.name}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Select Your Name from {selectedGroup.name}</h2>
                        <div className="space-y-3">
                            {allAttendees.filter(a => a.group === selectedGroup.id).map(attendee => (
                                <button key={attendee.id} onClick={() => handleLogin(attendee)} className="w-full p-4 bg-white border-2 border-sky-500 text-sky-700 font-semibold rounded-lg hover:bg-sky-50 transition-colors">
                                    {attendee.name}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setSelectedGroup(null)} className="mt-6 text-gray-600 hover:text-gray-800 font-medium">
                            &larr; Back to Groups
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const StepHealthInfo = () => (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Allergies & Medical Info</h2>
            <p className="text-gray-600 mb-6">Please provide any important health information for your group. This information will only be visible to the reunion organizers.</p>
            <div className="space-y-6">
                {currentGroupMembers.map(member => (
                    <div key={member.id} className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-lg font-semibold text-gray-800 mb-2">{member.name}</label>
                        <textarea
                            value={healthData[member.id]?.allergies || ''}
                            onChange={(e) => handleHealthDataChange(member.id, 'allergies', e.target.value)}
                            placeholder="e.g., Peanut allergy, bee sting allergy"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                            rows="2"
                        ></textarea>
                    </div>
                ))}
            </div>
        </div>
    );
    
    const StepEvents = () => (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Event & Activity RSVPs</h2>
            <p className="text-gray-600 mb-6">Let us know which extra activities your household will join.</p>
            <div className="space-y-3">
                {events.map(event => (
                    <label key={event.id} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${attendingEvents.includes(event.id) ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-500' : 'bg-white border-gray-300 hover:border-sky-400'}`}>
                        <input type="checkbox" checked={attendingEvents.includes(event.id)} onChange={() => handleToggle(setAttendingEvents, event.id)} className="h-5 w-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500"/>
                        <div className="ml-4 flex items-center text-lg font-medium text-gray-800">
                           <LucideIcon name={event.icon} className="w-5 h-5 mr-2 text-yellow-500" />
                           {event.name}
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
    
    const StepMealAttendance = () => (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Meal Attendance</h2>
            <p className="text-gray-600 mb-6">Which meals will your household be joining?</p>
            <div className="space-y-3">
                {INITIAL_DATA.MEALS.map(meal => (
                    <label key={meal.id} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${attendingMeals.includes(meal.id) ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-500' : 'bg-white border-gray-300 hover:border-sky-400'}`}>
                        <input type="checkbox" checked={attendingMeals.includes(meal.id)} onChange={() => handleToggle(setAttendingMeals, meal.id)} className="h-5 w-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500"/>
                        <span className="ml-4 text-lg font-medium text-gray-800">{meal.name}</span>
                    </label>
                ))}
            </div>
        </div>
    );

    const StepMealChoices = ({ meal }) => {
        const mealOptions = INITIAL_DATA.FOOD_OPTIONS[meal.id];
        return (
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{meal.name} Choices</h2>
                <p className="text-gray-600 mb-6">Please select dishes for each person.</p>
                <div className="space-y-8">
                    {currentGroupMembers.map(member => (
                        <div key={member.id} className="bg-gray-50 p-4 rounded-lg border">
                            <h3 className="font-bold text-lg text-gray-800 mb-4">{member.name}'s Plate</h3>
                            {Object.entries(mealOptions).map(([category, options]) => (
                                <div key={category} className="mb-4">
                                    <label className="block text-md font-medium text-gray-700 capitalize mb-2">{category} {category !== 'main' && '(choose multiple)'}</label>
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {options.map(option => {
                                            const isMulti = category !== 'main';
                                            const isChecked = isMulti 
                                                ? foodChoices[meal.id]?.[member.id]?.[category]?.includes(option.id)
                                                : foodChoices[meal.id]?.[member.id]?.[category] === option.id;

                                            return (
                                                <label key={option.id} className={`flex items-center p-3 border rounded-lg cursor-pointer ${isChecked ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-500' : 'bg-white hover:border-sky-400'}`}>
                                                    <input type={isMulti ? 'checkbox' : 'radio'} name={`${meal.id}-${member.id}-${category}`} checked={isChecked} onChange={() => handleFoodChoiceChange(meal.id, member.id, category, option.id, isMulti)} className="h-4 w-4 text-sky-600 border-gray-300 focus:ring-sky-500"/>
                                                    <div className="ml-3 flex items-center text-sm font-medium text-gray-700">{getIcon(category, option.id)} {option.name}</div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const StepDrinks = () => (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Drink Preferences</h2>
            <p className="text-gray-600 mb-6">Select all drinks your household would like available during the reunion.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {INITIAL_DATA.DRINKS.map(drink => (
                    <label key={drink.id} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${drinkChoices.includes(drink.id) ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-500' : 'bg-white border-gray-300 hover:border-sky-400'}`}>
                        <input type="checkbox" checked={drinkChoices.includes(drink.id)} onChange={() => handleToggle(setDrinkChoices, drink.id)} className="h-5 w-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500"/>
                        <span className="ml-3 font-medium text-gray-700">{drink.name}</span>
                    </label>
                ))}
            </div>
        </div>
    );
    
    const StepEquipment = () => (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">What to Bring? (Optional)</h2>
            <p className="text-gray-600 mb-6">If you can contribute any of these shared items, please check them off!</p>
            <div className="space-y-3">
                {INITIAL_DATA.EQUIPMENT.map(item => (
                    <label key={item.id} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${equipmentBringing.includes(item.id) ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-500' : 'bg-white border-gray-300 hover:border-sky-400'}`}>
                        <input type="checkbox" checked={equipmentBringing.includes(item.id)} onChange={() => handleToggle(setEquipmentBringing, item.id)} className="h-5 w-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500"/>
                        <div className="ml-4 flex items-center text-lg font-medium text-gray-800">{item.icon} {item.name}</div>
                    </label>
                ))}
            </div>
        </div>
    );

    const StepReview = () => (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Review Your Submission</h2>
            <p className="text-gray-600 mb-6">Please confirm everything looks correct.</p>
            <div className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center"><Users className="w-5 h-5 mr-2 text-sky-600"/>{currentGroup.name} ({currentGroupMembers.length} people)</h3>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center"><Tent className="w-5 h-5 mr-2 text-sky-600"/>Attending Events</h3>
                    <p>{attendingEvents.map(id => events.find(e => e.id === id)?.name).join(', ') || 'None'}</p>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center"><GlassWater className="w-5 h-5 mr-2 text-sky-600"/>Drink Preferences</h3>
                    <p>{drinkChoices.map(id => INITIAL_DATA.DRINKS.find(d => d.id === id)?.name).join(', ') || 'None'}</p>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center"><Package className="w-5 h-5 mr-2 text-sky-600"/>Bringing Equipment</h3>
                    <p>{equipmentBringing.map(id => INITIAL_DATA.EQUIPMENT.find(eq => eq.id === id)?.name).join(', ') || 'None'}</p>
                </div>
                <hr/>
                {attendingMealDetails.map(meal => (
                     <div key={meal.id}>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center"><Utensils className="w-5 h-5 mr-2 text-sky-600"/>{meal.name}</h3>
                        {currentGroupMembers.map(member => (
                            <div key={member.id} className="pl-4 mt-2 border-l-2 ml-2">
                                <p className="font-semibold text-md text-gray-800">{member.name}</p>
                                <ul className="list-none text-sm text-gray-600">
                                    {Object.entries(foodChoices[meal.id]?.[member.id] || {}).map(([cat, choices]) => {
                                        const choiceNames = Array.isArray(choices) 
                                            ? choices.map(cId => INITIAL_DATA.FOOD_OPTIONS[meal.id][cat].find(o => o.id === cId)?.name).join(', ')
                                            : INITIAL_DATA.FOOD_OPTIONS[meal.id][cat].find(o => o.id === choices)?.name;
                                        return choiceNames ? <li key={cat}><span className="font-medium capitalize">{cat}:</span> {choiceNames}</li> : null;
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );

    const renderForm = () => {
        let currentStepComponent;
        let mealSteps = attendingMealDetails.length;
        
        if (step === 0) return <StepLogin />;
        if (step === 1) currentStepComponent = <StepHealthInfo />;
        else if (step === 2) currentStepComponent = <StepEvents />;
        else if (step === 3) currentStepComponent = <StepMealAttendance />;
        else if (step > 3 && step <= 3 + mealSteps) {
            const mealIndex = step - 4;
            currentStepComponent = <StepMealChoices meal={attendingMealDetails[mealIndex]} />;
        } else if (step === 4 + mealSteps) currentStepComponent = <StepDrinks />;
        else if (step === 5 + mealSteps) currentStepComponent = <StepEquipment />;
        else if (step === 6 + mealSteps) currentStepComponent = <StepReview />;
        else currentStepComponent = <div>Something went wrong.</div>;

        return (
             <div className="w-full max-w-4xl mx-auto">
                <button onClick={handleLogout} className="mb-4 text-sm text-gray-500 hover:underline">&larr; Back to Dashboard</button>
                <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl w-full border border-gray-200">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
                        <div className="bg-sky-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
                    </div>
                    {currentStepComponent}
                    <div className="mt-8 flex justify-between items-center">
                        <button onClick={handlePrevStep} disabled={step <= 1} className="flex items-center px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
                            <ArrowLeft className="w-5 h-5 mr-2" /> Back
                        </button>
                        {step < totalSteps ? (
                            <button onClick={handleNextStep} className="flex items-center px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 shadow-md">
                                Next <ArrowRight className="w-5 h-5 ml-2" />
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 shadow-md disabled:bg-green-300">
                                {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin"/> : <Check className="w-5 h-5 mr-2" />} Submit
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };
    
    const ResultsCard = ({ title, children }) => (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-sky-200 pb-2">{title}</h3>
            {children}
        </div>
    );

    const AttendeeDashboard = () => {
        const [editingGroup, setEditingGroup] = useState(null);
        const [lodgingText, setLodgingText] = useState('');

        const handleEditLodging = (group) => {
            setEditingGroup(group.id);
            setLodgingText(group.stayingAt);
        };

        const handleSaveLodging = async (groupId) => {
            const groupRef = doc(db, `/artifacts/${appId}/public/data/groups`, groupId);
            await updateDoc(groupRef, { stayingAt: lodgingText });
            setEditingGroup(null);
        };

        return (
            <ResultsCard title="Attendees & Lodging">
                <div className="space-y-4">
                    {allGroups.map(group => (
                        <div key={group.id}>
                            <h3 className="text-xl font-bold text-sky-800 flex items-center justify-between">
                                {group.name}
                                <div className="flex items-center text-sm font-normal text-gray-600">
                                    <Home className="w-4 h-4 mr-2" />
                                    {editingGroup === group.id ? (
                                        <input 
                                            type="text"
                                            value={lodgingText}
                                            onChange={(e) => setLodgingText(e.target.value)}
                                            className="border-b-2 border-sky-500 bg-sky-50 px-1"
                                        />
                                    ) : (
                                        <span>{group.stayingAt}</span>
                                    )}
                                    {editingGroup === group.id ? (
                                        <button onClick={() => handleSaveLodging(group.id)} className="ml-2 p-1 text-green-600 hover:bg-green-100 rounded-full"><Check className="w-4 h-4"/></button>
                                    ) : (
                                        <button onClick={() => handleEditLodging(group)} className="ml-2 p-1 hover:bg-gray-200 rounded-full"><Pencil className="w-4 h-4"/></button>
                                    )}
                                </div>
                            </h3>
                            <p className="text-gray-700 pl-2">
                                {allAttendees.filter(a => a.group === group.id).map(a => a.name).join(', ')}
                            </p>
                        </div>
                    ))}
                </div>
            </ResultsCard>
        );
    };

    const FoodDashboard = () => {
        const totals = {
            drinks: INITIAL_DATA.DRINKS.reduce((acc, d) => ({...acc, [d.id]: 0}), {}),
            equipment: INITIAL_DATA.EQUIPMENT.reduce((acc, e) => ({...acc, [e.id]: []}), {}),
            events: events.reduce((acc, e) => ({...acc, [e.id]: []}), {}),
            food: INITIAL_DATA.MEALS.reduce((acc, m) => {
                acc[m.id] = {};
                if (INITIAL_DATA.FOOD_OPTIONS[m.id]) {
                    Object.keys(INITIAL_DATA.FOOD_OPTIONS[m.id]).forEach(cat => {
                        acc[m.id][cat] = INITIAL_DATA.FOOD_OPTIONS[m.id][cat].reduce((catAcc, opt) => ({...catAcc, [opt.id]: 0}), {});
                    });
                }
                return acc;
            }, {}),
        };

        allSubmissions.forEach(sub => {
            (sub.drinkChoices || []).forEach(d => { if(totals.drinks[d] !== undefined) totals.drinks[d] += (sub.members?.length || 1); });
            (sub.equipmentBringing || []).forEach(e => { if(totals.equipment[e]) totals.equipment[e].push(sub.groupName); });
            (sub.attendingEvents || []).forEach(e => { if(totals.events[e]) totals.events[e].push(sub.groupName); });
            
            Object.entries(sub.foodChoices || {}).forEach(([mealId, memberChoices]) => {
                if (!totals.food[mealId]) return;
                Object.values(memberChoices).forEach(choices => {
                    Object.entries(choices).forEach(([cat, catChoices]) => {
                         if (!totals.food[mealId][cat]) return;
                        if (Array.isArray(catChoices)) {
                            catChoices.forEach(c => { if(totals.food[mealId]?.[cat]?.[c] !== undefined) totals.food[mealId][cat][c]++; });
                        } else {
                            if(totals.food[mealId]?.[cat]?.[catChoices] !== undefined) totals.food[mealId][cat][catChoices]++;
                        }
                    });
                });
            });
        });
        
        return (
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <ResultsCard title="Meal & Drink Totals">
                        {INITIAL_DATA.MEALS.map(meal => (
                            <div key={meal.id} className="mb-4 last:mb-0">
                                <h4 className="font-bold text-sky-800 text-xl mb-3">{meal.name}</h4>
                                {Object.entries(totals.food[meal.id]).map(([cat, opts]) =>(
                                    <div key={cat} className="pl-4 mb-2">
                                        <p className="capitalize font-semibold text-md text-gray-700">{cat}</p>
                                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
                                            {Object.entries(opts).map(([optId, count]) => count > 0 && <span key={optId}>{INITIAL_DATA.FOOD_OPTIONS[meal.id][cat].find(o=>o.id===optId).name}: <span className="font-bold text-gray-900">{count}</span></span>)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                         <hr className="my-6"/>
                         <h4 className="font-bold text-sky-800 text-xl mb-3">Drink Requests (Total People)</h4>
                         <div className="flex flex-wrap gap-x-6 gap-y-2 text-md text-gray-600">
                            {Object.entries(totals.drinks).map(([drinkId, count]) => count > 0 && <span key={drinkId}>{INITIAL_DATA.DRINKS.find(d=>d.id===drinkId).name}: <span className="font-bold text-gray-900">{count}</span></span>)}
                         </div>
                    </ResultsCard>
                </div>

                <div className="space-y-8">
                    <ResultsCard title="Event RSVPs">
                        {events.map(event => (
                            <div key={event.id} className="mb-3 last:mb-0">
                                <h4 className="font-semibold text-md text-gray-800 flex items-center">
                                    <LucideIcon name={event.icon} className="w-5 h-5 mr-2 text-gray-700" />
                                    {event.name}
                                </h4>
                                <p className="text-sm text-gray-500 pl-7">{(totals.events[event.id] || []).join(', ') || 'No one yet'}</p>
                            </div>
                        ))}
                    </ResultsCard>
                    <ResultsCard title="Equipment Contributions">
                        {INITIAL_DATA.EQUIPMENT.map(item => (
                            <div key={item.id} className="mb-3 last:mb-0">
                                <h4 className="font-semibold text-md text-gray-800 flex items-center">{item.icon} {item.name}</h4>
                                <p className="text-sm text-gray-500 pl-7">{totals.equipment[item.id].join(', ') || 'No one yet'}</p>
                            </div>
                        ))}
                    </ResultsCard>
                </div>
            </div>
        );
    };

    const renderDashboard = () => (
        <div className="w-full max-w-7xl mx-auto">
             <div className="text-center mb-12">
                <PartyPopper className="w-16 h-16 mx-auto text-sky-500" />
                <h1 className="text-5xl font-extrabold text-gray-800 mt-4">Reunion Plan Dashboard</h1>
                {currentUser && <p className="text-lg text-gray-600 mt-2">Welcome, {currentUser.name}!</p>}
            </div>

            <div className="flex justify-center space-x-2 border-b-2 border-gray-200 mb-8">
                <button onClick={() => setDashboardTab('attendees')} className={`px-6 py-3 font-semibold ${dashboardTab === 'attendees' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-gray-500'}`}>Attendees</button>
                <button onClick={() => setDashboardTab('food')} className={`px-6 py-3 font-semibold ${dashboardTab === 'food' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-gray-500'}`}>Food & Events</button>
            </div>

            {dashboardTab === 'attendees' ? <AttendeeDashboard /> : <FoodDashboard />}

            <div className="mt-12 text-center">
                <button onClick={() => currentUser ? handleLogout() : setView('form')} className="px-8 py-3 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-colors shadow-md flex items-center mx-auto">
                    {currentUser ? 'Logout' : 'Fill Out / Edit Your Form'}
                </button>
            </div>
        </div>
    );

    // --- Main App Render ---
    if (isLoading) {
        return <div className="flex items-center justify-center h-screen"><Loader2 className="w-12 h-12 animate-spin text-sky-600"/></div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-900 p-4 sm:p-8">
            {view === 'form' ? renderForm() : renderDashboard()}
        </div>
    );
}
