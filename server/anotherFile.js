const getAllDocuments = async (collectionName) => {
    try {
      const snapshot = await db.collection(collectionName).get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };
  
  getAllDocuments("your_collection");
  